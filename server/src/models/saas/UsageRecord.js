import mongoose from 'mongoose';

const usageRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    period: { type: String, required: true, index: true },
    aiCredits: { type: Number, default: 0 },
    storageMb: { type: Number, default: 0 },
    resumeCount: { type: Number, default: 0 },
    interviewCount: { type: Number, default: 0 },
    apiUsage: { type: Number, default: 0 },
    codingSubmissions: { type: Number, default: 0 },
    jobApplications: { type: Number, default: 0 },
  },
  { timestamps: true },
);

usageRecordSchema.index({ userId: 1, period: 1 }, { unique: true });

usageRecordSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    period: this.period,
    aiCredits: this.aiCredits,
    storageMb: this.storageMb,
    resumeCount: this.resumeCount,
    interviewCount: this.interviewCount,
    apiUsage: this.apiUsage,
    codingSubmissions: this.codingSubmissions,
    jobApplications: this.jobApplications,
    updatedAt: this.updatedAt,
  };
};

export const UsageRecord = mongoose.model('UsageRecord', usageRecordSchema);
