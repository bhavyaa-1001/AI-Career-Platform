import mongoose from 'mongoose';

export const JOB_MODERATION_STATUSES = ['pending', 'approved', 'rejected'];
export const JOB_ADMIN_STATUSES = ['active', 'featured', 'expired', 'archived'];

const adminJobMetaSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      unique: true,
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: JOB_MODERATION_STATUSES,
      default: 'approved',
      index: true,
    },
    adminStatus: {
      type: String,
      enum: JOB_ADMIN_STATUSES,
      default: 'active',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    featuredUntil: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    rejectionReason: { type: String, maxlength: 500, default: '' },
    reportCount: { type: Number, default: 0 },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    moderatedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

adminJobMetaSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    jobId: this.jobId.toString(),
    moderationStatus: this.moderationStatus,
    adminStatus: this.adminStatus,
    isFeatured: this.isFeatured,
    featuredUntil: this.featuredUntil,
    expiresAt: this.expiresAt,
    rejectionReason: this.rejectionReason,
    reportCount: this.reportCount,
    moderatedAt: this.moderatedAt,
    createdAt: this.createdAt,
  };
};

export const AdminJobMeta = mongoose.model('AdminJobMeta', adminJobMetaSchema);
