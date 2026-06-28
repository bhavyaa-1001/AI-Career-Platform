import bcrypt from 'bcryptjs';

import { isEmailConfigured } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateOtp, generateSecureToken, hashToken } from '../utils/crypto.js';

import { deleteAvatar, uploadAvatar } from './cloudinaryService.js';
import { sendPasswordResetEmail, sendSignupOtpEmail } from './emailService.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshCookieMaxAge,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from './tokenService.js';

const SALT_ROUNDS = 12;
const MAX_REFRESH_TOKENS = 5;

const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const cleanExpiredRefreshTokens = (user) => {
  const now = new Date();
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.expiresAt > now);
};

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const issueSignupOtp = async (user) => {
  const otp = generateOtp();
  user.emailOtpHash = hashToken(otp);
  user.emailOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  user.emailOtpAttempts = 0;
  await user.save();
  await sendSignupOtpEmail(user.email, user.firstName, otp);
  return isEmailConfigured ? undefined : otp;
};

export const registerUser = async ({ firstName, lastName, email, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    if (!existing.isEmailVerified) {
      throw new ApiError(
        409,
        'An account with this email exists but is not verified. Please verify with OTP or request a new code.',
        [],
        'EMAIL_NOT_VERIFIED',
      );
    }
    throw new ApiError(409, 'An account with this email already exists');
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password: hashedPassword,
    role,
    isEmailVerified: false,
  });

  const devOtp = await issueSignupOtp(user);

  return {
    user: user.toSafeObject(),
    requiresVerification: true,
    devOtp,
  };
};

export const verifySignupOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+emailOtpHash +emailOtpExpires +emailOtpAttempts +refreshTokens',
  );

  if (!user) {
    throw new ApiError(404, 'No pending signup found for this email');
  }
  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified. You can sign in.');
  }
  if (!user.emailOtpHash || !user.emailOtpExpires) {
    throw new ApiError(400, 'No active verification code. Please request a new OTP.');
  }
  if (user.emailOtpExpires < new Date()) {
    throw new ApiError(400, 'Verification code expired. Please request a new OTP.', [], 'OTP_EXPIRED');
  }
  if (user.emailOtpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new ApiError(429, 'Too many failed attempts. Please request a new OTP.', [], 'OTP_LOCKED');
  }

  const normalizedOtp = String(otp).trim();
  if (hashToken(normalizedOtp) !== user.emailOtpHash) {
    user.emailOtpAttempts += 1;
    await user.save();
    throw new ApiError(400, 'Invalid verification code');
  }

  user.isEmailVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpires = undefined;
  user.emailOtpAttempts = 0;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  cleanExpiredRefreshTokens(user);
  const refreshToken = generateRefreshToken(user._id, false);
  user.refreshTokens.push({
    token: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(false),
    rememberMe: false,
  });
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
    rememberMe: false,
  };
};

export const resendSignupOtp = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+emailOtpHash +emailOtpExpires +emailOtpAttempts');

  if (!user) {
    throw new ApiError(404, 'No account found for this email');
  }
  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }

  const devOtp = await issueSignupOtp(user);
  return { devOtp };
};

export const loginUser = async ({ email, password, rememberMe }) => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      'Email not verified. Enter the OTP sent to your email to complete signup.',
      [],
      'EMAIL_NOT_VERIFIED',
    );
  }

  user.lastLogin = new Date();
  cleanExpiredRefreshTokens(user);

  const refreshToken = generateRefreshToken(user._id, rememberMe);
  const hashedRefresh = hashToken(refreshToken);

  user.refreshTokens.push({
    token: hashedRefresh,
    expiresAt: getRefreshTokenExpiry(rememberMe),
    rememberMe,
  });

  if (user.refreshTokens.length > MAX_REFRESH_TOKENS) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_REFRESH_TOKENS);
  }

  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
    rememberMe,
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  const hashed = hashToken(refreshToken);

  const user = await User.findById(decoded.sub).select('+refreshTokens');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  cleanExpiredRefreshTokens(user);

  const storedToken = user.refreshTokens.find((rt) => rt.token === hashed);
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const rememberMe = storedToken.rememberMe;
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashed);

  const newRefreshToken = generateRefreshToken(user._id, rememberMe);
  user.refreshTokens.push({
    token: hashToken(newRefreshToken),
    expiresAt: getRefreshTokenExpiry(rememberMe),
    rememberMe,
  });

  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken: newRefreshToken,
    rememberMe,
  };
};

export const logoutUser = async (userId, refreshToken) => {
  if (!refreshToken) return;

  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;

  const hashed = hashToken(refreshToken);
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashed);
  await user.save();
};

export const logoutAllDevices = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokens: [] });
};

export const verifyEmail = async (token) => {
  const hashed = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user.toSafeObject();
};

export const resendVerificationEmail = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isEmailVerified) throw new ApiError(400, 'Email is already verified');

  const devOtp = await issueSignupOtp(user);
  return devOtp;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = generateSecureToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user.email, user.firstName, resetToken);
};

export const resetPassword = async (token, newPassword) => {
  const hashed = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password +passwordResetToken +passwordResetExpires +refreshTokens');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, false);

  user.refreshTokens.push({
    token: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(false),
    rememberMe: false,
  });
  await user.save();

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken,
    rememberMe: false,
  };
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password +refreshTokens');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = await hashPassword(newPassword);
  user.refreshTokens = [];
  await user.save();
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user.toSafeObject();
};

export const updateUserProfile = async (userId, { firstName, lastName }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  await user.save();

  return user.toSafeObject();
};

export const uploadUserAvatar = async (userId, fileBuffer) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.avatar?.publicId) {
    await deleteAvatar(user.avatar.publicId);
  }

  const uploaded = await uploadAvatar(fileBuffer);
  user.avatar = uploaded;
  await user.save();

  return user.toSafeObject();
};

export { getRefreshCookieMaxAge };
