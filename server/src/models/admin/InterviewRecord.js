import mongoose from 'mongoose';

export const INTERVIEW_TYPES = ['mock', 'voice', 'technical', 'behavioral'];
export const INTERVIEW_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];

const interviewRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: { type: String, enum: INTERVIEW_TYPES, default: 'mock' },
    status: { type: String, enum: INTERVIEW_STATUSES, default: 'completed', index: true },
    title: { type: String, maxlength: 200, default: 'Mock Interview' },
    duration: { type: Number, default: 0 },
    score: { type: Number, min: 0, max: 100, default: null },
    feedback: { type: String, maxlength: 5000, default: '' },
    questions: { type: [String], default: [] },
    answers: { type: [String], default: [] },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewTemplate', default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

interviewRecordSchema.index({ userId: 1, createdAt: -1 });

interviewRecordSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    type: this.type,
    status: this.status,
    title: this.title,
    duration: this.duration,
    score: this.score,
    feedback: this.feedback,
    questions: this.questions,
    templateId: this.templateId?.toString() || null,
    createdAt: this.createdAt,
  };
};

export const InterviewRecord = mongoose.model('InterviewRecord', interviewRecordSchema);
