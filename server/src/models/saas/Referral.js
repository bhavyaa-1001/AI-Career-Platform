import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    referralCode: { type: String, required: true, uppercase: true, index: true },
    status: { type: String, enum: ['pending', 'qualified', 'rewarded'], default: 'pending', index: true },
    rewardCredits: { type: Number, default: 0 },
    qualifiedAt: { type: Date, default: null },
    rewardedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

referralSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    referredUserId: this.referredUserId.toString(),
    referralCode: this.referralCode,
    status: this.status,
    rewardCredits: this.rewardCredits,
    createdAt: this.createdAt,
  };
};

export const Referral = mongoose.model('Referral', referralSchema);
