import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    versionNumber: { type: Number, required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    label: { type: String, trim: true, maxlength: 100, default: 'Auto-save' },
  },
  { timestamps: true },
);

resumeVersionSchema.index({ resumeId: 1, versionNumber: -1 });

resumeVersionSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    resumeId: this.resumeId.toString(),
    versionNumber: this.versionNumber,
    snapshot: this.snapshot,
    label: this.label,
    createdAt: this.createdAt,
  };
};

export const ResumeVersion = mongoose.model('ResumeVersion', resumeVersionSchema);
