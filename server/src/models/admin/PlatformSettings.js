import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
    category: {
      type: String,
      enum: ['global', 'email', 'cloudinary', 'gemini', 'jwt', 'branding', 'maintenance', 'features'],
      default: 'global',
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

platformSettingsSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    key: this.key,
    value: this.value,
    category: this.category,
    updatedAt: this.updatedAt,
  };
};

export const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
