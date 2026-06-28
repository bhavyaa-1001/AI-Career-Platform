import mongoose from 'mongoose';

import { CODING_LANGUAGES } from '../config/codingConstants.js';

const codeReviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingSubmission', default: null },
    language: { type: String, enum: CODING_LANGUAGES, required: true },
    sourceCode: { type: String, required: true, maxlength: 50000 },
    bugs: { type: [String], default: [] },
    optimizations: { type: [String], default: [] },
    namingSuggestions: { type: [String], default: [] },
    codeSmells: { type: [String], default: [] },
    securityIssues: { type: [String], default: [] },
    bestPractices: { type: [String], default: [] },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    alternativeSolutions: { type: [String], default: [] },
    summary: { type: String, default: '' },
    model: { type: String, default: '' },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

codeReviewSchema.index({ userId: 1, createdAt: -1 });

codeReviewSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    problemId: this.problemId.toString(),
    submissionId: this.submissionId?.toString() || null,
    language: this.language,
    sourceCode: this.sourceCode,
    bugs: this.bugs,
    optimizations: this.optimizations,
    namingSuggestions: this.namingSuggestions,
    codeSmells: this.codeSmells,
    securityIssues: this.securityIssues,
    bestPractices: this.bestPractices,
    timeComplexity: this.timeComplexity,
    spaceComplexity: this.spaceComplexity,
    alternativeSolutions: this.alternativeSolutions,
    summary: this.summary,
    model: this.model,
    durationMs: this.durationMs,
    createdAt: this.createdAt,
  };
};

export const CodeReview = mongoose.model('CodeReview', codeReviewSchema);
