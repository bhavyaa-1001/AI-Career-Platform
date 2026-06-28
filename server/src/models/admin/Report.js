import mongoose from 'mongoose';

export const REPORT_TYPES = ['user', 'job', 'spam', 'abuse'];
export const REPORT_STATUSES = ['pending', 'reviewing', 'resolved', 'dismissed'];

const reportSchema = new mongoose.Schema(
  {
    type: { type: String, enum: REPORT_TYPES, required: true, index: true },
    status: { type: String, enum: REPORT_STATUSES, default: 'pending', index: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    targetType: { type: String, maxlength: 50, default: '' },
    targetId: { type: String, maxlength: 50, default: '' },
    reason: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 2000, default: '' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolution: { type: String, maxlength: 1000, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reportSchema.index({ createdAt: -1 });

reportSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    type: this.type,
    status: this.status,
    reporterId: this.reporterId?.toString() || null,
    targetType: this.targetType,
    targetId: this.targetId,
    reason: this.reason,
    description: this.description,
    resolvedBy: this.resolvedBy?.toString() || null,
    resolution: this.resolution,
    resolvedAt: this.resolvedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Report = mongoose.model('Report', reportSchema);
