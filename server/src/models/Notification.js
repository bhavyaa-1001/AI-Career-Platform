import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['system', 'profile', 'reminder', 'achievement'],
      default: 'system',
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, trim: true, maxlength: 500, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

notificationSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    type: this.type,
    title: this.title,
    message: this.message,
    link: this.link,
    isRead: this.isRead,
    createdAt: this.createdAt,
  };
};

export const Notification = mongoose.model('Notification', notificationSchema);
