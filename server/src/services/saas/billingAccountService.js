import crypto from 'crypto';

import { SAAS_PLANS } from '../../config/saasConstants.js';
import { Plan } from '../../models/admin/Plan.js';
import { Subscription } from '../../models/admin/Subscription.js';
import { BillingAccount } from '../../models/saas/BillingAccount.js';
import { ApiError } from '../../utils/ApiError.js';

const generateReferralCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

export const getOrCreateBillingAccount = async (userId) => {
  let account = await BillingAccount.findOne({ userId });
  if (account) return account;

  account = await BillingAccount.create({
    userId,
    referralCode: generateReferralCode(),
  });

  const freePlan = await Plan.findOne({ slug: 'free', isActive: true });
  if (freePlan) {
    account.planId = freePlan._id;
    await account.save();
  }

  return account;
};

export const getUserPlan = async (userId) => {
  const account = await getOrCreateBillingAccount(userId);
  let plan = null;

  if (account.activeSubscriptionId) {
    const sub = await Subscription.findById(account.activeSubscriptionId).populate('planId');
    if (sub?.status === 'active' || sub?.status === 'trialing') {
      plan = sub.planId || await Plan.findById(sub.planId);
    }
  }

  if (!plan && account.planId) {
    plan = await Plan.findById(account.planId);
  }

  if (!plan) {
    plan = await Plan.findOne({ slug: 'free', isActive: true });
  }

  return { account, plan, limits: plan?.limits || SAAS_PLANS[0].limits };
};

export const applyReferralCode = async (userId, code) => {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  const account = await getOrCreateBillingAccount(userId);
  if (account.referredByUserId) throw new ApiError(400, 'Referral already applied');

  const referrer = await BillingAccount.findOne({ referralCode: normalized });
  if (!referrer) throw new ApiError(404, 'Invalid referral code');
  if (referrer.userId.toString() === userId.toString()) {
    throw new ApiError(400, 'Cannot use your own referral code');
  }

  account.referredByUserId = referrer.userId;
  await account.save();
  return referrer;
};

export const getBillingOverview = async (userId) => {
  const account = await getOrCreateBillingAccount(userId);
  const { plan, limits } = await getUserPlan(userId);
  const subscription = account.activeSubscriptionId
    ? await Subscription.findById(account.activeSubscriptionId)
    : null;

  return {
    account: account.toSafeObject(),
    plan: plan?.toSafeObject() || null,
    limits,
    subscription: subscription ? {
      id: subscription._id.toString(),
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialEnd: subscription.trialEnd,
    } : null,
  };
};
