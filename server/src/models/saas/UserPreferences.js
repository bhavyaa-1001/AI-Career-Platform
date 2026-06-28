import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    language: { type: String, default: 'en', maxlength: 10 },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    privacy: {
      profilePublic: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: false },
      analyticsOptIn: { type: Boolean, default: true },
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      subscriptionRenewals: { type: Boolean, default: true },
      paymentSuccess: { type: Boolean, default: true },
      paymentFailed: { type: Boolean, default: true },
      trialEnding: { type: Boolean, default: true },
      upgradeSuggestions: { type: Boolean, default: true },
      referralUpdates: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

userPreferencesSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    language: this.language,
    theme: this.theme,
    privacy: this.privacy,
    notifications: this.notifications,
    updatedAt: this.updatedAt,
  };
};

export const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);
