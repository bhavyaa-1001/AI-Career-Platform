import mongoose from 'mongoose';

export const BROADCAST_CHANNELS = ['in_app', 'email', 'push'];
export const BROADCAST_STATUSES = ['draft', 'scheduled', 'sent', 'failed'];

const broadcastMessageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 2000 },
    channels: { type: [{ type: String, enum: BROADCAST_CHANNELS }], default: ['in_app'] },
    targetRoles: { type: [{ type: String, enum: ['student', 'recruiter', 'sub_admin', 'admin'] }], default: [] },
    status: { type: String, enum: BROADCAST_STATUSES, default: 'draft', index: true },
    scheduledAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
    recipientCount: { type: Number, default: 0 },
    link: { type: String, maxlength: 300, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

broadcastMessageSchema.index({ createdAt: -1 });

broadcastMessageSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    title: this.title,
    message: this.message,
    channels: this.channels,
    targetRoles: this.targetRoles,
    status: this.status,
    scheduledAt: this.scheduledAt,
    sentAt: this.sentAt,
    recipientCount: this.recipientCount,
    link: this.link,
    createdBy: this.createdBy.toString(),
    createdAt: this.createdAt,
  };
};

export const BroadcastMessage = mongoose.model('BroadcastMessage', broadcastMessageSchema);
