import mongoose from 'mongoose';

import { CODING_LANGUAGES, SUBMISSION_STATUSES } from '../config/codingConstants.js';

const testResultSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' },
    actualOutput: { type: String, default: '' },
    error: { type: String, default: '' },
    timeMs: { type: Number, default: 0 },
    memoryKb: { type: Number, default: 0 },
  },
  { _id: false },
);

const codingSubmissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingContest', default: null, index: true },
    language: { type: String, enum: CODING_LANGUAGES, required: true },
    sourceCode: { type: String, required: true, maxlength: 50000 },
    status: { type: String, enum: SUBMISSION_STATUSES, default: 'pending', index: true },
    executionTimeMs: { type: Number, default: 0 },
    memoryKb: { type: Number, default: 0 },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    testResults: { type: [testResultSchema], default: [] },
    compileOutput: { type: String, default: '' },
    runtimeError: { type: String, default: '' },
    isRun: { type: Boolean, default: false },
  },
  { timestamps: true },
);

codingSubmissionSchema.index({ userId: 1, createdAt: -1 });
codingSubmissionSchema.index({ problemId: 1, status: 1 });
codingSubmissionSchema.index({ contestId: 1, userId: 1 });

codingSubmissionSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    problemId: this.problemId.toString(),
    contestId: this.contestId?.toString() || null,
    language: this.language,
    sourceCode: this.sourceCode,
    status: this.status,
    executionTimeMs: this.executionTimeMs,
    memoryKb: this.memoryKb,
    passedTestCases: this.passedTestCases,
    totalTestCases: this.totalTestCases,
    testResults: this.testResults,
    compileOutput: this.compileOutput,
    runtimeError: this.runtimeError,
    isRun: this.isRun,
    submittedAt: this.createdAt,
    createdAt: this.createdAt,
  };
};

export const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);
