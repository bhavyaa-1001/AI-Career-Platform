import mongoose from 'mongoose';

export const INVOICE_STATUSES = ['draft', 'open', 'paid', 'void', 'uncollectible'];

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    stripeInvoiceId: { type: String, default: '', index: true },
    number: { type: String, default: '' },
    status: { type: String, enum: INVOICE_STATUSES, default: 'open', index: true },
    amountDue: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    currency: { type: String, default: 'USD', maxlength: 3 },
    pdfUrl: { type: String, default: '' },
    hostedUrl: { type: String, default: '' },
    periodStart: { type: Date, default: null },
    periodEnd: { type: Date, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true },
);

invoiceSchema.index({ userId: 1, createdAt: -1 });

invoiceSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    number: this.number,
    status: this.status,
    amountDue: this.amountDue,
    amountPaid: this.amountPaid,
    tax: this.tax,
    currency: this.currency,
    pdfUrl: this.pdfUrl,
    hostedUrl: this.hostedUrl,
    periodStart: this.periodStart,
    periodEnd: this.periodEnd,
    paidAt: this.paidAt,
    createdAt: this.createdAt,
  };
};

export const Invoice = mongoose.model('Invoice', invoiceSchema);
