import mongoose from 'mongoose';

const billingAddressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    name: { type: String, default: '', maxlength: 120 },
    line1: { type: String, default: '', maxlength: 200 },
    line2: { type: String, default: '', maxlength: 200 },
    city: { type: String, default: '', maxlength: 100 },
    state: { type: String, default: '', maxlength: 100 },
    postalCode: { type: String, default: '', maxlength: 20 },
    country: { type: String, default: 'US', maxlength: 2 },
    taxId: { type: String, default: '' },
  },
  { timestamps: true },
);

billingAddressSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    line1: this.line1,
    line2: this.line2,
    city: this.city,
    state: this.state,
    postalCode: this.postalCode,
    country: this.country,
    taxId: this.taxId,
  };
};

export const BillingAddress = mongoose.model('BillingAddress', billingAddressSchema);
