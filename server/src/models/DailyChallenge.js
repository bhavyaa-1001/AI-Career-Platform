import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
    bonusPoints: { type: Number, default: 20, min: 0 },
  },
  { timestamps: true },
);

dailyChallengeSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    date: this.date,
    problemId: this.problemId.toString(),
    bonusPoints: this.bonusPoints,
    createdAt: this.createdAt,
  };
};

export const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);
