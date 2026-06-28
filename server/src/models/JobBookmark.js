import mongoose from 'mongoose';

const jobBookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

jobBookmarkSchema.index({ userId: 1, jobId: 1 }, { unique: true });
jobBookmarkSchema.index({ userId: 1, createdAt: -1 });

jobBookmarkSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    jobId: this.jobId.toString(),
    createdAt: this.createdAt,
  };
};

export const JobBookmark = mongoose.model('JobBookmark', jobBookmarkSchema);
