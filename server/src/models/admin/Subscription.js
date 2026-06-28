import mongoose from 'mongoose';

export const SUBSCRIPTION_STATUSES = ['active', 'cancelled', 'expired', 'trialing', 'past_due', 'incomplete'];

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    status: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'active', index: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, maxlength: 3, default: 'USD' },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    externalId: { type: String, maxlength: 200, default: '' },
    stripeSubscriptionId: { type: String, default: '', index: true },
    stripeCustomerId: { type: String, default: '' },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    trialEnd: { type: Date, default: null },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  },
  { timestamps: true },
);

subscriptionSchema.index({ userId: 1, status: 1 });

subscriptionSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    planId: this.planId.toString(),
    status: this.status,
    amount: this.amount,
    currency: this.currency,
    currentPeriodStart: this.currentPeriodStart,
    currentPeriodEnd: this.currentPeriodEnd,
    cancelledAt: this.cancelledAt,
    createdAt: this.createdAt,
  };
};

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
