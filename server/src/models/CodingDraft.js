import mongoose from 'mongoose';

import { CODING_LANGUAGES } from '../config/codingConstants.js';

const codingDraftSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    language: { type: String, enum: CODING_LANGUAGES, required: true },
    sourceCode: { type: String, required: true, maxlength: 50000 },
  },
  { timestamps: true },
);

codingDraftSchema.index({ userId: 1, problemId: 1 }, { unique: true });

codingDraftSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    problemId: this.problemId.toString(),
    language: this.language,
    sourceCode: this.sourceCode,
    updatedAt: this.updatedAt,
  };
};

export const CodingDraft = mongoose.model('CodingDraft', codingDraftSchema);
