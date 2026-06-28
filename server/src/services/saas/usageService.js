import { isUnlimited, SAAS_PLANS, USAGE_TO_LIMIT_MAP } from '../../config/saasConstants.js';
import { Plan } from '../../models/admin/Plan.js';
import { UsageRecord } from '../../models/saas/UsageRecord.js';
import { ApiError } from '../../utils/ApiError.js';

import { getUserPlan } from './billingAccountService.js';


const currentPeriod = () => new Date().toISOString().slice(0, 7);

export const getUsageRecord = async (userId) => {
  const period = currentPeriod();
  let record = await UsageRecord.findOne({ userId, period });
  if (!record) {
    record = await UsageRecord.create({ userId, period });
  }
  return record;
};

export const getUsageSummary = async (userId) => {
  const record = await getUsageRecord(userId);
  const { limits } = await getUserPlan(userId);

  const usage = record.toSafeObject();
  const mapped = {};

  Object.entries(USAGE_TO_LIMIT_MAP).forEach(([usageKey, limitKey]) => {
    const used = usage[usageKey] || 0;
    const limit = limits[limitKey] ?? 0;
    mapped[usageKey] = {
      used,
      limit: isUnlimited(limit) ? null : limit,
      unlimited: isUnlimited(limit),
      remaining: isUnlimited(limit) ? null : Math.max(0, limit - used),
    };
  });

  return { period: usage.period, usage: mapped, raw: usage };
};

export const incrementUsage = async (userId, metric, amount = 1) => {
  const period = currentPeriod();
  const field = metric;
  const validFields = ['aiCredits', 'storageMb', 'resumeCount', 'interviewCount', 'apiUsage', 'codingSubmissions', 'jobApplications'];
  if (!validFields.includes(field)) throw new ApiError(400, 'Invalid usage metric');

  const record = await UsageRecord.findOneAndUpdate(
    { userId, period },
    { $inc: { [field]: amount } },
    { upsert: true, new: true },
  );

  return record;
};

export const checkUsageLimit = async (userId, metric) => {
  const limitKey = USAGE_TO_LIMIT_MAP[metric];
  if (!limitKey) return { allowed: true };

  const { limits } = await getUserPlan(userId);
  const limit = limits[limitKey];
  if (isUnlimited(limit)) return { allowed: true, unlimited: true };

  const record = await getUsageRecord(userId);
  const used = record[metric] || 0;

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      message: `Plan limit reached for ${metric}. Upgrade your subscription to continue.`,
    };
  }

  return { allowed: true, used, limit, remaining: limit - used };
};

export const assertUsageLimit = async (userId, metric) => {
  const result = await checkUsageLimit(userId, metric);
  if (!result.allowed) {
    throw new ApiError(403, result.message);
  }
  return result;
};

export const listPlans = async () => {
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
  if (plans.length) return plans.map((p) => p.toSafeObject());
  return SAAS_PLANS;
};
