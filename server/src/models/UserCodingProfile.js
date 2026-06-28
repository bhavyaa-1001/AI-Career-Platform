import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userCodingProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    totalPoints: { type: Number, default: 0, index: true },
    weeklyPoints: { type: Number, default: 0, index: true },
    monthlyPoints: { type: Number, default: 0, index: true },
    totalSolved: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: '' },
    badges: { type: [badgeSchema], default: [] },
    languageUsage: { type: Map, of: Number, default: {} },
    difficultySolved: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    dailyActivity: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

userCodingProfileSchema.methods.toSafeObject = function () {
  const languageUsage = {};
  if (this.languageUsage instanceof Map) {
    this.languageUsage.forEach((v, k) => { languageUsage[k] = v; });
  }
  const dailyActivity = {};
  if (this.dailyActivity instanceof Map) {
    this.dailyActivity.forEach((v, k) => { dailyActivity[k] = v; });
  }

  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    totalPoints: this.totalPoints,
    weeklyPoints: this.weeklyPoints,
    monthlyPoints: this.monthlyPoints,
    totalSolved: this.totalSolved,
    totalAttempted: this.totalAttempted,
    currentStreak: this.currentStreak,
    longestStreak: this.longestStreak,
    lastActiveDate: this.lastActiveDate,
    badges: this.badges,
    languageUsage,
    difficultySolved: this.difficultySolved,
    dailyActivity,
    updatedAt: this.updatedAt,
  };
};

export const UserCodingProfile = mongoose.model('UserCodingProfile', userCodingProfileSchema);
