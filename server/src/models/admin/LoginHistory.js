import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ip: { type: String, maxlength: 45, default: '' },
    userAgent: { type: String, maxlength: 500, default: '' },
    success: { type: Boolean, default: true },
    method: { type: String, enum: ['password', 'refresh', 'admin_reset'], default: 'password' },
  },
  { timestamps: true },
);

loginHistorySchema.index({ userId: 1, createdAt: -1 });
loginHistorySchema.index({ createdAt: -1 });

loginHistorySchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    ip: this.ip,
    userAgent: this.userAgent,
    success: this.success,
    method: this.method,
    createdAt: this.createdAt,
  };
};

export const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
