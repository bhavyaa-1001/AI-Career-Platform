import mongoose from 'mongoose';

import { CONTEST_STATUSES } from '../config/codingConstants.js';

const codingContestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, maxlength: 8000, default: '' },
    problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem' }],
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 30, max: 1440 },
    status: { type: String, enum: CONTEST_STATUSES, default: 'scheduled', index: true },
    isVirtual: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 1000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

codingContestSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    slug: this.slug,
    description: this.description,
    problemIds: this.problemIds.map((id) => id.toString()),
    startTime: this.startTime,
    endTime: this.endTime,
    durationMinutes: this.durationMinutes,
    status: this.status,
    isVirtual: this.isVirtual,
    maxParticipants: this.maxParticipants,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const CodingContest = mongoose.model('CodingContest', codingContestSchema);
