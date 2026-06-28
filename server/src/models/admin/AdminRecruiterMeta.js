import mongoose from 'mongoose';

export const RECRUITER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];
export const KYC_STATUSES = ['not_started', 'pending', 'verified', 'rejected'];
export const PREMIUM_STATUSES = ['none', 'basic', 'premium', 'enterprise'];

const adminRecruiterMetaSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    status: {
      type: String,
      enum: RECRUITER_STATUSES,
      default: 'approved',
      index: true,
    },
    kycStatus: {
      type: String,
      enum: KYC_STATUSES,
      default: 'not_started',
      index: true,
    },
    premiumStatus: {
      type: String,
      enum: PREMIUM_STATUSES,
      default: 'none',
    },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, maxlength: 500, default: '' },
    kycDocuments: { type: [String], default: [] },
    adminNotes: { type: String, maxlength: 2000, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

adminRecruiterMetaSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    recruiterId: this.recruiterId.toString(),
    companyId: this.companyId?.toString() || null,
    status: this.status,
    kycStatus: this.kycStatus,
    premiumStatus: this.premiumStatus,
    isVerified: this.isVerified,
    verifiedAt: this.verifiedAt,
    rejectionReason: this.rejectionReason,
    adminNotes: this.adminNotes,
    reviewedAt: this.reviewedAt,
    createdAt: this.createdAt,
  };
};

export const AdminRecruiterMeta = mongoose.model('AdminRecruiterMeta', adminRecruiterMetaSchema);
