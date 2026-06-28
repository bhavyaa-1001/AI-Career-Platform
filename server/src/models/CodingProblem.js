import mongoose from 'mongoose';

import {
  CODING_LANGUAGES, PROBLEM_CATEGORIES, PROBLEM_DIFFICULTIES, PROBLEM_STATUSES,
} from '../config/codingConstants.js';

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true, maxlength: 10000 },
    output: { type: String, required: true, maxlength: 10000 },
    explanation: { type: String, maxlength: 2000, default: '' },
  },
  { _id: false },
);

const codingProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, maxlength: 20000 },
    difficulty: { type: String, enum: PROBLEM_DIFFICULTIES, required: true, index: true },
    category: { type: String, enum: PROBLEM_CATEGORIES, default: 'other', index: true },
    tags: { type: [String], default: [] },
    constraints: { type: String, maxlength: 4000, default: '' },
    inputFormat: { type: String, maxlength: 4000, default: '' },
    outputFormat: { type: String, maxlength: 4000, default: '' },
    sampleTestCases: { type: [testCaseSchema], default: [] },
    hiddenTestCases: { type: [testCaseSchema], default: [] },
    hints: { type: [String], default: [] },
    editorial: { type: String, maxlength: 20000, default: '' },
    starterCode: { type: Map, of: String, default: {} },
    supportedLanguages: { type: [String], enum: CODING_LANGUAGES, default: CODING_LANGUAGES },
    timeLimitMs: { type: Number, default: 2000, min: 500, max: 30000 },
    memoryLimitKb: { type: Number, default: 262144, min: 65536, max: 524288 },
    companies: { type: [String], default: [] },
    points: { type: Number, default: 10, min: 1, max: 1000 },
    status: { type: String, enum: PROBLEM_STATUSES, default: 'draft', index: true },
    acceptanceRate: { type: Number, default: 0, min: 0, max: 100 },
    totalSubmissions: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

codingProblemSchema.index({ status: 1, difficulty: 1 });
codingProblemSchema.index({ tags: 1 });

codingProblemSchema.methods.toSafeObject = function ({ includeHidden = false } = {}) {
  const starterCode = {};
  if (this.starterCode instanceof Map) {
    this.starterCode.forEach((v, k) => { starterCode[k] = v; });
  } else if (this.starterCode) {
    Object.assign(starterCode, this.starterCode);
  }

  return {
    id: this._id.toString(),
    title: this.title,
    slug: this.slug,
    description: this.description,
    difficulty: this.difficulty,
    category: this.category,
    tags: this.tags,
    constraints: this.constraints,
    inputFormat: this.inputFormat,
    outputFormat: this.outputFormat,
    sampleTestCases: this.sampleTestCases,
    hiddenTestCases: includeHidden ? this.hiddenTestCases : undefined,
    hints: this.hints,
    editorial: this.editorial,
    starterCode,
    supportedLanguages: this.supportedLanguages,
    timeLimitMs: this.timeLimitMs,
    memoryLimitKb: this.memoryLimitKb,
    companies: this.companies,
    points: this.points,
    status: this.status,
    acceptanceRate: this.acceptanceRate,
    totalSubmissions: this.totalSubmissions,
    totalAccepted: this.totalAccepted,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const CodingProblem = mongoose.model('CodingProblem', codingProblemSchema);
