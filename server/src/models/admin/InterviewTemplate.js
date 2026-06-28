import mongoose from 'mongoose';

export const TEMPLATE_CATEGORIES = ['technical', 'behavioral', 'system_design', 'general'];

const interviewTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: TEMPLATE_CATEGORIES, default: 'general', index: true },
    description: { type: String, maxlength: 1000, default: '' },
    prompt: { type: String, maxlength: 5000, default: '' },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuestionBank' }],
    duration: { type: Number, default: 30 },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

interviewTemplateSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    category: this.category,
    description: this.description,
    prompt: this.prompt,
    questionIds: this.questionIds.map((q) => q.toString()),
    duration: this.duration,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export const InterviewTemplate = mongoose.model('InterviewTemplate', interviewTemplateSchema);
