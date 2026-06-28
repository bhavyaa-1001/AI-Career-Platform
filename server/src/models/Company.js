import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, maxlength: 2000, default: '' },
    website: { type: String, maxlength: 200, default: '' },
    logoUrl: { type: String, maxlength: 500, default: '' },
    industry: { type: String, maxlength: 80, default: '' },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', ''],
      default: '',
    },
    location: { type: String, maxlength: 120, default: '' },
    foundedYear: { type: Number, min: 1800, max: 2100, default: null },
  },
  { timestamps: true },
);

companySchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    recruiterId: this.recruiterId.toString(),
    name: this.name,
    description: this.description,
    website: this.website,
    logoUrl: this.logoUrl,
    industry: this.industry,
    size: this.size,
    location: this.location,
    foundedYear: this.foundedYear,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Company = mongoose.model('Company', companySchema);
