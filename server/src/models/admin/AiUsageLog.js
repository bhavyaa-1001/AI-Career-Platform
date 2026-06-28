import mongoose from 'mongoose';

export const AI_FEATURES = [
  'resume_analysis', 'resume_rewrite', 'resume_match', 'cover_letter',
  'code_review', 'code_hint', 'code_visual_hint',
];

const aiUsageLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    feature: { type: String, enum: AI_FEATURES, required: true, index: true },
    tokensUsed: { type: Number, default: 0 },
    success: { type: Boolean, default: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

aiUsageLogSchema.index({ userId: 1, createdAt: -1 });
aiUsageLogSchema.index({ feature: 1, createdAt: -1 });

aiUsageLogSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    feature: this.feature,
    tokensUsed: this.tokensUsed,
    success: this.success,
    metadata: this.metadata,
    createdAt: this.createdAt,
  };
};

export const AiUsageLog = mongoose.model('AiUsageLog', aiUsageLogSchema);
