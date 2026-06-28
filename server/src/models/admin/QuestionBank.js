import mongoose from 'mongoose';

export const QUESTION_CATEGORIES = ['technical', 'behavioral', 'system_design', 'coding', 'general'];
export const QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'];

const questionBankSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, maxlength: 2000 },
    category: { type: String, enum: QUESTION_CATEGORIES, default: 'general', index: true },
    difficulty: { type: String, enum: QUESTION_DIFFICULTIES, default: 'medium' },
    tags: { type: [String], default: [] },
    sampleAnswer: { type: String, maxlength: 5000, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

questionBankSchema.index({ category: 1, difficulty: 1 });

questionBankSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    question: this.question,
    category: this.category,
    difficulty: this.difficulty,
    tags: this.tags,
    sampleAnswer: this.sampleAnswer,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);
