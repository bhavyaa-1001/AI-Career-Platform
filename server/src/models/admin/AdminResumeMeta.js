import mongoose from 'mongoose';

export const RESUME_ADMIN_STATUSES = ['active', 'deleted', 'archived'];

const adminResumeMetaSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminStatus: {
      type: String,
      enum: RESUME_ADMIN_STATUSES,
      default: 'active',
      index: true,
    },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastAtsScore: { type: Number, min: 0, max: 100, default: null },
  },
  { timestamps: true },
);

adminResumeMetaSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    resumeId: this.resumeId.toString(),
    userId: this.userId.toString(),
    adminStatus: this.adminStatus,
    deletedAt: this.deletedAt,
    lastAtsScore: this.lastAtsScore,
    createdAt: this.createdAt,
  };
};

export const AdminResumeMeta = mongoose.model('AdminResumeMeta', adminResumeMetaSchema);
