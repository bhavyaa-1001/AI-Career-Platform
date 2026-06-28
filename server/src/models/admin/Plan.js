import mongoose from 'mongoose';

export const PLAN_INTERVALS = ['monthly', 'yearly', 'lifetime'];
export const PLAN_AUDIENCES = ['student', 'recruiter', 'both'];

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    description: { type: String, maxlength: 500, default: '' },
    price: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, maxlength: 3, default: 'USD' },
    interval: { type: String, enum: PLAN_INTERVALS, default: 'monthly' },
    audience: { type: String, enum: PLAN_AUDIENCES, default: 'both' },
    features: { type: [String], default: [] },
    limits: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    stripeProductId: { type: String, default: '' },
    stripePriceId: { type: String, default: '' },
    trialDays: { type: Number, default: 0 },
    prioritySupport: { type: Boolean, default: false },
  },
  { timestamps: true },
);

planSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    slug: this.slug,
    description: this.description,
    price: this.price,
    currency: this.currency,
    interval: this.interval,
    audience: this.audience,
    features: this.features,
    limits: this.limits,
    isActive: this.isActive,
    sortOrder: this.sortOrder,
    stripePriceId: this.stripePriceId || null,
    trialDays: this.trialDays,
    prioritySupport: this.prioritySupport,
    createdAt: this.createdAt,
  };
};

export const Plan = mongoose.model('Plan', planSchema);
