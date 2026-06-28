import { getDBStatus } from '../config/db.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    success: true,
    data: {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      database: {
        status: dbStatus,
      },
      version: '1.0.0',
    },
  });
});
