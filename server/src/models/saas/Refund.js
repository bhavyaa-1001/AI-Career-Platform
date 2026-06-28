import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    stripeRefundId: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    reason: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

refundSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    amount: this.amount,
    currency: this.currency,
    reason: this.reason,
    status: this.status,
    createdAt: this.createdAt,
  };
};

export const Refund = mongoose.model('Refund', refundSchema);
