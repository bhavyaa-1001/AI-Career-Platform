import { assertFullAdmin } from '../../config/roles.js';
import { getStripe } from '../../config/stripe.js';
import { Plan } from '../../models/admin/Plan.js';
import { Subscription } from '../../models/admin/Subscription.js';
import { Coupon } from '../../models/saas/Coupon.js';
import { Payment } from '../../models/saas/Payment.js';
import { Referral } from '../../models/saas/Referral.js';
import { Refund } from '../../models/saas/Refund.js';
import { ApiError } from '../../utils/ApiError.js';

export const getSaasRevenueDashboard = async (_query = {}) => {
  const [activeSubs, totalRevenue, mrr, referrals, coupons] = await Promise.all([
    Subscription.countDocuments({ status: { $in: ['active', 'trialing'] } }),
    Payment.aggregate([{ $match: { status: 'succeeded' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, mrr: { $sum: '$amount' } } },
    ]),
    Referral.countDocuments({ status: 'rewarded' }),
    Coupon.countDocuments({ isActive: true }),
  ]);

  const subsByPlan = await Subscription.aggregate([
    { $match: { status: { $in: ['active', 'trialing'] } } },
    { $group: { _id: '$planId', count: { $sum: 1 } } },
  ]);

  const revenueOverTime = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
  ]);

  return {
    summary: {
      activeSubscriptions: activeSubs,
      totalRevenue: totalRevenue[0]?.total || 0,
      mrr: mrr[0]?.mrr || 0,
      rewardedReferrals: referrals,
      activeCoupons: coupons,
    },
    subscriptionsByPlan: subsByPlan,
    revenueOverTime: revenueOverTime.map((r) => ({ month: r._id, revenue: r.revenue })),
  };
};

export const adminListPlans = async () => {
  const plans = await Plan.find({}).sort({ sortOrder: 1 });
  return plans.map((p) => p.toSafeObject());
};

export const adminUpdatePlan = async (planId, data) => {
  const plan = await Plan.findByIdAndUpdate(planId, data, { new: true });
  if (!plan) throw new ApiError(404, 'Plan not found');
  return plan.toSafeObject();
};

export const adminProcessRefund = async (admin, paymentId, { amount, reason }) => {
  assertFullAdmin(admin.role);
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, 'Payment not found');

  let stripeRefundId = '';
  if (payment.stripePaymentIntentId && getStripe()) {
    const refund = await getStripe().refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(amount * 100),
    });
    stripeRefundId = refund.id;
  }

  payment.status = 'refunded';
  await payment.save();

  const refund = await Refund.create({
    userId: payment.userId,
    paymentId: payment._id,
    stripeRefundId,
    amount,
    currency: payment.currency,
    reason,
    status: 'succeeded',
    processedBy: admin._id,
  });

  return refund.toSafeObject();
};

export const adminListSubscriptions = async ({ page = 1, limit = 20, status } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;
  const [subs, total] = await Promise.all([
    Subscription.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('planId', 'name slug'),
    Subscription.countDocuments(filter),
  ]);

  return {
    subscriptions: subs.map((s) => ({
      ...s.toSafeObject(),
      planName: s.planId?.name,
      planSlug: s.planId?.slug,
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};
