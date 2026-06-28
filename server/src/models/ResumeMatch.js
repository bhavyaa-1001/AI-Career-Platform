import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true, maxlength: 80 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    reason: { type: String, maxlength: 300, default: '' },
  },
  { _id: false },
);

const insightSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
    detail: { type: String, maxlength: 500, default: '' },
  },
  { _id: false },
);

const learningSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, maxlength: 120 },
    resource: { type: String, maxlength: 200, default: '' },
    reason: { type: String, maxlength: 300, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { _id: false },
);

const resumeMatchSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    resumeTitle: { type: String, maxlength: 100, default: '' },
    jobTitle: { type: String, maxlength: 120, default: '' },
    companyName: { type: String, maxlength: 120, default: '' },
    jobDescription: { type: String, required: true, maxlength: 8000 },
    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    summary: { type: String, maxlength: 2000, default: '' },
    missingSkills: [skillGapSchema],
    matchedSkills: [{ type: String, maxlength: 80 }],
    strengths: [insightSchema],
    weaknesses: [insightSchema],
    learningSuggestions: [learningSchema],
    model: { type: String, default: null },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

resumeMatchSchema.index({ userId: 1, createdAt: -1 });

resumeMatchSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    resumeId: this.resumeId.toString(),
    resumeTitle: this.resumeTitle,
    jobTitle: this.jobTitle,
    companyName: this.companyName,
    jobDescription: this.jobDescription,
    matchScore: this.matchScore,
    summary: this.summary,
    missingSkills: this.missingSkills || [],
    matchedSkills: this.matchedSkills || [],
    strengths: this.strengths || [],
    weaknesses: this.weaknesses || [],
    learningSuggestions: this.learningSuggestions || [],
    model: this.model,
    durationMs: this.durationMs,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const ResumeMatch = mongoose.model('ResumeMatch', resumeMatchSchema);
