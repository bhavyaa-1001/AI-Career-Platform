import mongoose from 'mongoose';

const contestParticipantSchema = new mongoose.Schema(
  {
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingContest', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, default: 0 },
    solvedCount: { type: Number, default: 0 },
    rank: { type: Number, default: null },
    joinedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

contestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestParticipantSchema.index({ contestId: 1, score: -1, solvedCount: -1 });

contestParticipantSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    contestId: this.contestId.toString(),
    userId: this.userId.toString(),
    score: this.score,
    solvedCount: this.solvedCount,
    rank: this.rank,
    joinedAt: this.joinedAt,
    finishedAt: this.finishedAt,
  };
};

export const ContestParticipant = mongoose.model('ContestParticipant', contestParticipantSchema);
