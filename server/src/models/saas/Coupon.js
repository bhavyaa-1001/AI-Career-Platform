import mongoose from 'mongoose';

export const COUPON_TYPES = ['percent', 'fixed'];
export const COUPON_DURATIONS = ['once', 'repeating', 'forever'];

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: COUPON_TYPES, default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    duration: { type: String, enum: COUPON_DURATIONS, default: 'once' },
    durationMonths: { type: Number, default: null },
    maxRedemptions: { type: Number, default: null },
    redemptionCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    applicablePlans: [{ type: String }],
    stripeCouponId: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

couponSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    code: this.code,
    name: this.name,
    type: this.type,
    value: this.value,
    duration: this.duration,
    maxRedemptions: this.maxRedemptions,
    redemptionCount: this.redemptionCount,
    expiresAt: this.expiresAt,
    applicablePlans: this.applicablePlans,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const Coupon = mongoose.model('Coupon', couponSchema);

const couponRedemptionSchema = new mongoose.Schema(
  {
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    discountAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

couponRedemptionSchema.index({ couponId: 1, userId: 1 }, { unique: true });

export const CouponRedemption = mongoose.model('CouponRedemption', couponRedemptionSchema);
