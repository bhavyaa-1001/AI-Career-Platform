import {
  changePassword,
  forgotPassword,
  getRefreshCookieMaxAge,
  getUserProfile,
  loginUser,
  logoutAllDevices,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendSignupOtp,
  resendVerificationEmail,
  resetPassword,
  updateUserProfile,
  uploadUserAvatar,
  verifyEmail,
  verifySignupOtp,
} from '../services/authService.js';
import { initializeSaasUser } from '../services/saas/onboardingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
};

const setRefreshCookie = (res, refreshToken, rememberMe) => {
  res.cookie('refreshToken', refreshToken, {
    ...REFRESH_COOKIE_OPTIONS,
    maxAge: getRefreshCookieMaxAge(rememberMe),
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
};

const sendAuthResponse = (res, statusCode, { user, accessToken, refreshToken, rememberMe }) => {
  if (refreshToken) {
    setRefreshCookie(res, refreshToken, rememberMe);
  }

  res.status(statusCode).json({
    success: true,
    data: { user, accessToken },
  });
};

export const register = asyncHandler(async (req, res) => {
  const userData = { ...req.body };
  delete userData.confirmPassword;
  const { user, requiresVerification, devOtp } = await registerUser(userData);

  res.status(201).json({
    success: true,
    message: 'Account created. Enter the 6-digit OTP sent to your email to activate your account.',
    data: { user, requiresVerification, email: user.email },
    ...(devOtp && { devOtp }),
  });
});

export const verifySignupOtpHandler = asyncHandler(async (req, res) => {
  const result = await verifySignupOtp(req.body);
  await initializeSaasUser(result.user.id, { referralCode: req.body.referralCode });
  sendAuthResponse(res, 200, result);
});

export const resendSignupOtpHandler = asyncHandler(async (req, res) => {
  const { devOtp } = await resendSignupOtp(req.body.email);
  res.status(200).json({
    success: true,
    message: 'A new verification code has been sent to your email.',
    ...(devOtp && { devOtp }),
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  sendAuthResponse(res, 200, result);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: 'Refresh token not found' });
    return;
  }

  const result = await refreshAccessToken(token);
  sendAuthResponse(res, 200, result);
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (req.user) {
    await logoutUser(req.user._id, token);
  }

  clearRefreshCookie(res);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const logoutAll = asyncHandler(async (req, res) => {
  await logoutAllDevices(req.user._id);
  clearRefreshCookie(res);
  res.status(200).json({ success: true, message: 'Logged out from all devices' });
});

export const verifyEmailToken = asyncHandler(async (req, res) => {
  const user = await verifyEmail(req.params.token);
  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: { user },
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const devOtp = await resendVerificationEmail(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Verification code sent to your email',
    ...(devOtp && { devOtp }),
  });
});

export const forgotPasswordHandler = asyncHandler(async (req, res) => {
  await forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: 'If an account exists with that email, a reset link has been sent',
  });
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  delete body.confirmPassword;
  const result = await resetPassword(req.params.token, body.password);
  sendAuthResponse(res, 200, result);
});

export const changePasswordHandler = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await changePassword(req.user._id, { currentPassword, newPassword });
  clearRefreshCookie(res);
  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again.',
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user._id);
  res.status(200).json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const user = await uploadUserAvatar(req.user._id, req.file.buffer);
  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { user },
  });
});
