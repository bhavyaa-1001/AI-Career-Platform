import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateSecureToken, hashToken } from '../utils/crypto.js';

import { deleteAvatar, uploadAvatar } from './cloudinaryService.js';
import { sendPasswordResetEmail, sendVerificationEmail } from './emailService.js';
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

export const registerUser = async ({ firstName, lastName, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const verificationToken = generateSecureToken();
  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const verifyUrl = await sendVerificationEmail(email, firstName, verificationToken);

  return {
    user: user.toSafeObject(),
    devVerificationUrl: env.NODE_ENV === 'development' ? verifyUrl : undefined,
  };
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

  const verificationToken = generateSecureToken();
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verifyUrl = await sendVerificationEmail(user.email, user.firstName, verificationToken);

  return env.NODE_ENV === 'development' ? verifyUrl : undefined;
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
