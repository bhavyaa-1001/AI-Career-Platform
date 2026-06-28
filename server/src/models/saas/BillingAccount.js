import mongoose from 'mongoose';

const billingAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    stripeCustomerId: { type: String, default: '', index: true },
    activeSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },
    referralCode: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    referredByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralCredits: { type: Number, default: 0 },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    taxId: { type: String, default: '' },
  },
  { timestamps: true },
);

billingAccountSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    stripeCustomerId: this.stripeCustomerId || null,
    planId: this.planId?.toString() || null,
    referralCode: this.referralCode,
    referralCredits: this.referralCredits,
    organizationId: this.organizationId?.toString() || null,
    createdAt: this.createdAt,
  };
};

export const BillingAccount = mongoose.model('BillingAccount', billingAccountSchema);
