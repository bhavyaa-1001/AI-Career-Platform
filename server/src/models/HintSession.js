import mongoose from 'mongoose';

const hintSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    hintsUsed: { type: Number, default: 0, min: 0, max: 4 },
    history: [{
      level: { type: Number, required: true },
      type: { type: String, enum: ['hint', 'dry_run', 'visual'], required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true },
);

hintSessionSchema.index({ userId: 1, problemId: 1 }, { unique: true });

hintSessionSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    problemId: this.problemId.toString(),
    hintsUsed: this.hintsUsed,
    history: this.history,
    updatedAt: this.updatedAt,
  };
};

export const HintSession = mongoose.model('HintSession', hintSessionSchema);
