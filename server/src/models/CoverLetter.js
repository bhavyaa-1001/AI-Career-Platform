import mongoose from 'mongoose';

const coverLetterSchema = new mongoose.Schema(
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
    resumeTitle: { type: String, maxlength: 100, default: null },
    company: { type: String, required: true, maxlength: 120, trim: true },
    role: { type: String, required: true, maxlength: 120, trim: true },
    jobDescription: { type: String, maxlength: 8000, default: '' },
    tone: {
      type: String,
      enum: ['professional', 'confident', 'friendly', 'formal', 'enthusiastic'],
      default: 'professional',
    },
    length: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium',
    },
    body: { type: String, required: true, maxlength: 12000 },
    model: { type: String, default: null },
    wordCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

coverLetterSchema.index({ userId: 1, createdAt: -1 });

coverLetterSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    resumeId: this.resumeId?.toString() || null,
    resumeTitle: this.resumeTitle,
    company: this.company,
    role: this.role,
    jobDescription: this.jobDescription,
    tone: this.tone,
    length: this.length,
    body: this.body,
    model: this.model,
    wordCount: this.wordCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
