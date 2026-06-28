import { BillingAccount } from '../../models/saas/BillingAccount.js';
import { Coupon, CouponRedemption } from '../../models/saas/Coupon.js';
import { Referral } from '../../models/saas/Referral.js';
import { ApiError } from '../../utils/ApiError.js';

import { applyReferralCode, getOrCreateBillingAccount } from './billingAccountService.js';
import { incrementUsage } from './usageService.js';

export const validateCoupon = async (code, userId, planSlug) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid coupon');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, 'Coupon expired');
  if (coupon.maxRedemptions && coupon.redemptionCount >= coupon.maxRedemptions) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }
  if (coupon.applicablePlans?.length && !coupon.applicablePlans.includes(planSlug)) {
    throw new ApiError(400, 'Coupon not valid for this plan');
  }

  const existing = await CouponRedemption.findOne({ couponId: coupon._id, userId });
  if (existing) throw new ApiError(400, 'Coupon already redeemed');

  return coupon.toSafeObject();
};

export const redeemCoupon = async (userId, code, subscriptionId = null) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid coupon');

  await CouponRedemption.create({ couponId: coupon._id, userId, subscriptionId });
  coupon.redemptionCount += 1;
  await coupon.save();
  return coupon.toSafeObject();
};

export const listCoupons = async (query = {}) => {
  const filter = {};
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
  return coupons.map((c) => c.toSafeObject());
};

export const createCoupon = async (admin, data) => {
  const coupon = await Coupon.create({
    code: data.code.toUpperCase(),
    name: data.code.toUpperCase(),
    type: data.discountType,
    value: data.discountValue,
    maxRedemptions: data.maxRedemptions || null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    applicablePlans: data.applicablePlans || [],
    isActive: data.isActive !== false,
    createdBy: admin._id,
  });
  return coupon.toSafeObject();
};

export const getReferralDashboard = async (userId) => {
  const account = await getOrCreateBillingAccount(userId);
  const referrals = await Referral.find({ referrerId: userId }).sort({ createdAt: -1 }).limit(50);
  const stats = await Referral.aggregate([
    { $match: { referrerId: account.userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return {
    referralCode: account.referralCode,
    referralCredits: account.referralCredits,
    stats: Object.fromEntries(stats.map((s) => [s._id, s.count])),
    referrals: referrals.map((r) => r.toSafeObject()),
    inviteUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${account.referralCode}`,
  };
};

export const registerReferral = async (userId, code) => {
  const referrerAccount = await applyReferralCode(userId, code);
  if (!referrerAccount) return null;

  await Referral.create({
    referrerId: referrerAccount.userId,
    referredUserId: userId,
    referralCode: code.toUpperCase(),
    status: 'pending',
  });

  return { applied: true };
};

export const qualifyReferral = async (referredUserId) => {
  const referral = await Referral.findOne({ referredUserId, status: 'pending' });
  if (!referral) return null;

  referral.status = 'qualified';
  referral.qualifiedAt = new Date();
  referral.rewardCredits = 10;
  await referral.save();

  await BillingAccount.findOneAndUpdate(
    { userId: referral.referrerId },
    { $inc: { referralCredits: 10 } },
  );

  referral.status = 'rewarded';
  referral.rewardedAt = new Date();
  await referral.save();

  await incrementUsage(referral.referrerId, 'aiCredits', -10);
  return referral.toSafeObject();
};
