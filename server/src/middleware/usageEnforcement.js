import { authenticate } from './auth.js';
import { assertUsageLimit, incrementUsage } from '../services/saas/usageService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DEFAULT_ENFORCE_METHODS = ['POST'];

export const enforceUsage = (metric, { increment = false, amount = 1, methods = DEFAULT_ENFORCE_METHODS } = {}) =>
  asyncHandler(async (req, res, next) => {
    if (!methods.includes(req.method)) return next();
    if (!req.user) throw new ApiError(401, 'Authentication required');
    if (['admin', 'sub_admin'].includes(req.user.role)) return next();

    await assertUsageLimit(req.user._id, metric);
    if (increment) {
      res.on('finish', () => {
        if (res.statusCode < 400) {
          incrementUsage(req.user._id, metric, amount).catch(() => {});
        }
      });
    }
    next();
  });

/** Mount before domain routers so req.user exists when limits are checked. */
export const withUsageLimit = (metric, options = {}) => [authenticate, enforceUsage(metric, options)];

export const trackUsageOnSuccess = (metric, amount = 1) =>
  asyncHandler(async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (body?.success !== false && req.user && !['admin', 'sub_admin'].includes(req.user.role)) {
        incrementUsage(req.user._id, metric, amount).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  });
