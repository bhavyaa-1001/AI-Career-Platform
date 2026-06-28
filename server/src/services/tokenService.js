import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? env.JWT_REFRESH_REMEMBER_EXPIRES_IN : env.JWT_REFRESH_EXPIRES_IN;
  return jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new ApiError(401, 'Invalid refresh token');
    }
    return decoded;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

export const getRefreshTokenExpiry = (rememberMe = false) => {
  const duration = rememberMe ? env.JWT_REFRESH_REMEMBER_EXPIRES_IN : env.JWT_REFRESH_EXPIRES_IN;
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  return new Date(Date.now() + value * multipliers[unit]);
};

export const getRefreshCookieMaxAge = (rememberMe = false) => {
  const expiry = getRefreshTokenExpiry(rememberMe);
  return expiry.getTime() - Date.now();
};
