import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'profile_update', 'profile_draft', 'profile_publish', 'avatar_upload',
        'login', 'register', 'resume_analysis',
        'company_created', 'company_updated', 'job_posted', 'job_updated',
        'application_received', 'application_reviewed',
      ],
      required: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

activitySchema.index({ userId: 1, createdAt: -1 });

activitySchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    action: this.action,
    description: this.description,
    metadata: this.metadata,
    createdAt: this.createdAt,
  };
};

export const Activity = mongoose.model('Activity', activitySchema);
