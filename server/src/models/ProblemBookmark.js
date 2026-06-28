import mongoose from 'mongoose';

const problemBookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    isBookmarked: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    status: { type: String, enum: ['none', 'attempted', 'solved'], default: 'none', index: true },
    lastAttemptedAt: { type: Date, default: null },
    solvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

problemBookmarkSchema.index({ userId: 1, problemId: 1 }, { unique: true });
problemBookmarkSchema.index({ userId: 1, isBookmarked: 1 });
problemBookmarkSchema.index({ userId: 1, isFavorite: 1 });
problemBookmarkSchema.index({ userId: 1, lastAttemptedAt: -1 });

problemBookmarkSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    problemId: this.problemId.toString(),
    isBookmarked: this.isBookmarked,
    isFavorite: this.isFavorite,
    status: this.status,
    lastAttemptedAt: this.lastAttemptedAt,
    solvedAt: this.solvedAt,
    updatedAt: this.updatedAt,
  };
};

export const ProblemBookmark = mongoose.model('ProblemBookmark', problemBookmarkSchema);
