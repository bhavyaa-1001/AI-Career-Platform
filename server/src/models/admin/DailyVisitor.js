import mongoose from 'mongoose';

const dailyVisitorSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    visitors: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    authenticatedVisits: { type: Number, default: 0 },
  },
  { timestamps: true },
);

dailyVisitorSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    date: this.date,
    visitors: this.visitors,
    uniqueVisitors: this.uniqueVisitors,
    pageViews: this.pageViews,
    authenticatedVisits: this.authenticatedVisits,
  };
};

export const DailyVisitor = mongoose.model('DailyVisitor', dailyVisitorSchema);
