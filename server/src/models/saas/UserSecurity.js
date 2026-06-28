import mongoose from 'mongoose';

const userSecuritySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false, default: '' },
    twoFactorBackupCodes: { type: [String], select: false, default: [] },
    passwordHistory: { type: [String], select: false, default: [] },
    activeSessions: [{
      sessionId: String,
      ip: String,
      userAgent: String,
      createdAt: { type: Date, default: Date.now },
      lastActiveAt: { type: Date, default: Date.now },
    }],
    trustedDevices: [{
      deviceId: String,
      name: String,
      ip: String,
      userAgent: String,
      trustedAt: { type: Date, default: Date.now },
    }],
    deleteRequestedAt: { type: Date, default: null },
    dataExportRequestedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSecuritySchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    twoFactorEnabled: this.twoFactorEnabled,
    activeSessionCount: this.activeSessions?.length || 0,
    trustedDeviceCount: this.trustedDevices?.length || 0,
    deleteRequestedAt: this.deleteRequestedAt,
    dataExportRequestedAt: this.dataExportRequestedAt,
  };
};

export const UserSecurity = mongoose.model('UserSecurity', userSecuritySchema);
