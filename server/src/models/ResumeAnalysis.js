import mongoose from 'mongoose';

const grammarIssueSchema = new mongoose.Schema(
  {
    text: { type: String, default: '' },
    suggestion: { type: String, default: '' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { _id: false },
);

const weakBulletSchema = new mongoose.Schema(
  {
    original: { type: String, default: '' },
    suggestion: { type: String, default: '' },
    section: { type: String, default: 'experience' },
  },
  { _id: false },
);

const keywordSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true },
    reason: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { _id: false },
);

const improvementTipSchema = new mongoose.Schema(
  {
    category: { type: String, default: 'general' },
    tip: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { _id: false },
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['upload', 'resume'],
      required: true,
    },
    sourceFileName: { type: String, maxlength: 255, default: null },
    sourceFileType: { type: String, enum: ['pdf', 'docx'], default: null },
    resumeTitle: { type: String, maxlength: 100, default: null },
    targetRole: { type: String, maxlength: 120, default: null },
    targetJobDescription: { type: String, maxlength: 5000, default: null },
    rawTextLength: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['completed', 'failed'],
      default: 'completed',
    },
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    grammar: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      issues: [grammarIssueSchema],
    },
    missingSkills: [{ type: String, maxlength: 80 }],
    weakBulletPoints: [weakBulletSchema],
    keywordSuggestions: [keywordSchema],
    resumeSummary: { type: String, maxlength: 3000, default: '' },
    improvementTips: [improvementTipSchema],
    model: { type: String, default: null },
    durationMs: { type: Number, default: 0 },
    error: { type: String, default: null },
  },
  { timestamps: true },
);

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });
resumeAnalysisSchema.index({ resumeId: 1, createdAt: -1 });

resumeAnalysisSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    resumeId: this.resumeId?.toString() || null,
    sourceType: this.sourceType,
    sourceFileName: this.sourceFileName,
    sourceFileType: this.sourceFileType,
    resumeTitle: this.resumeTitle,
    targetRole: this.targetRole,
    targetJobDescription: this.targetJobDescription,
    rawTextLength: this.rawTextLength,
    status: this.status,
    atsScore: this.atsScore,
    grammar: this.grammar,
    missingSkills: this.missingSkills,
    weakBulletPoints: this.weakBulletPoints,
    keywordSuggestions: this.keywordSuggestions,
    resumeSummary: this.resumeSummary,
    improvementTips: this.improvementTips,
    model: this.model,
    durationMs: this.durationMs,
    error: this.error,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ResumeAnalysis = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
