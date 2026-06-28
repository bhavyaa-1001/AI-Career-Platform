import { ZodError } from 'zod';

import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    const field = Object.keys(err.keyValue || {})[0];
    if (field) errors = [{ field, message: `${field} already exists` }];
  }

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (statusCode >= 500) {
    logger.error(`${statusCode} — ${message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(`${statusCode} — ${message}`, {
      url: req.originalUrl,
      method: req.method,
      ...(errors.length > 0 && { errors }),
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.code && { code: err.code }),
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
