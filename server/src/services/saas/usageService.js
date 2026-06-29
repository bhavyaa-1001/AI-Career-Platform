import { isUnlimited, SAAS_PLANS, USAGE_TO_LIMIT_MAP } from '../../config/saasConstants.js';
import { CodingSubmission } from '../../models/CodingSubmission.js';
import { Plan } from '../../models/admin/Plan.js';
import { UsageRecord } from '../../models/saas/UsageRecord.js';
import { ApiError } from '../../utils/ApiError.js';

import { getUserPlan } from './billingAccountService.js';


const currentPeriod = () => new Date().toISOString().slice(0, 7);

const periodStartDate = (period = currentPeriod()) => new Date(`${period}-01T00:00:00.000Z`);

/** Corrects inflated codingSubmissions counts from when drafts/runs were wrongly metered. */
const reconcileCodingSubmissions = async (userId, record) => {
  const actualCount = await CodingSubmission.countDocuments({
    userId,
    isRun: false,
    createdAt: { $gte: periodStartDate(record.period) },
  });

  if (record.codingSubmissions !== actualCount) {
    record.codingSubmissions = actualCount;
    await record.save();
  }

  return actualCount;
};

export const getUsageRecord = async (userId) => {
  const period = currentPeriod();
  try {
    return await UsageRecord.findOneAndUpdate(
      { userId, period },
      { $setOnInsert: { userId, period } },
      { upsert: true, new: true },
    );
  } catch (err) {
    if (err.code === 11000) {
      return UsageRecord.findOne({ userId, period });
    }
    throw err;
  }
};

export const getUsageSummary = async (userId) => {
  const record = await getUsageRecord(userId);
  await reconcileCodingSubmissions(userId, record);
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
  let used = record[metric] || 0;

  if (metric === 'codingSubmissions') {
    used = await reconcileCodingSubmissions(userId, record);
  }

  if (used >= limit) {
    const message = metric === 'codingSubmissions'
      ? `Monthly coding submit limit reached (${used}/${limit}). Upgrade on Billing, or use Run to test without submitting.`
      : `Plan limit reached for ${metric} (${used}/${limit}). Upgrade your subscription to continue.`;

    return {
      allowed: false,
      used,
      limit,
      message,
    };
  }

  return { allowed: true, used, limit, remaining: limit - used };
};

export const assertUsageLimit = async (userId, metric) => {
  const result = await checkUsageLimit(userId, metric);
  if (!result.allowed) {
    throw new ApiError(403, result.message, [], 'PLAN_LIMIT_REACHED');
  }
  return result;
};

export const listPlans = async () => {
  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
  if (plans.length) return plans.map((p) => p.toSafeObject());
  return SAAS_PLANS;
};
