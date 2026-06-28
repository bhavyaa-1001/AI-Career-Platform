import mongoose from 'mongoose';

const adminUserMetaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date, default: null },
    bannedReason: { type: String, maxlength: 500, default: '' },
    isSuspended: { type: Boolean, default: false },
    suspendedUntil: { type: Date, default: null },
    suspendReason: { type: String, maxlength: 500, default: '' },
    adminNotes: { type: String, maxlength: 2000, default: '' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

adminUserMetaSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    isBanned: this.isBanned,
    bannedAt: this.bannedAt,
    bannedReason: this.bannedReason,
    isSuspended: this.isSuspended,
    suspendedUntil: this.suspendedUntil,
    suspendReason: this.suspendReason,
    adminNotes: this.adminNotes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const AdminUserMeta = mongoose.model('AdminUserMeta', adminUserMetaSchema);
