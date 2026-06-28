import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired access token');
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or account deactivated');
  }

  req.user = user;
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to access this resource');
    }

    next();
  });

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.sub);
    if (user?.isActive) req.user = user;
  } catch {
    // ignore invalid token for optional auth
  }

  next();
});
