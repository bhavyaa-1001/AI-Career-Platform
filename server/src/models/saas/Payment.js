import mongoose from 'mongoose';

export const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed', 'refunded'];

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    stripePaymentIntentId: { type: String, default: '', index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD', maxlength: 3 },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending', index: true },
    description: { type: String, default: '' },
    failureMessage: { type: String, default: '' },
  },
  { timestamps: true },
);

paymentSchema.index({ userId: 1, createdAt: -1 });

paymentSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    description: this.description,
    createdAt: this.createdAt,
  };
};

export const Payment = mongoose.model('Payment', paymentSchema);
