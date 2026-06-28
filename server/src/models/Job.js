import mongoose from 'mongoose';

export const JOB_STATUSES = ['draft', 'open', 'closed'];
export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    companyName: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 8000 },
    requirements: { type: String, maxlength: 4000, default: '' },
    responsibilities: { type: String, maxlength: 4000, default: '' },
    location: { type: String, maxlength: 120, default: '' },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      default: 'full-time',
    },
    salaryMin: { type: Number, min: 0, default: null },
    salaryMax: { type: Number, min: 0, default: null },
    salaryCurrency: { type: String, maxlength: 3, default: 'USD' },
    skills: { type: [String], default: [] },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'draft',
      index: true,
    },
    applicantCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

jobSchema.index({ recruiterId: 1, createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });

jobSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    recruiterId: this.recruiterId.toString(),
    companyId: this.companyId.toString(),
    companyName: this.companyName,
    title: this.title,
    description: this.description,
    requirements: this.requirements,
    responsibilities: this.responsibilities,
    location: this.location,
    employmentType: this.employmentType,
    salaryMin: this.salaryMin,
    salaryMax: this.salaryMax,
    salaryCurrency: this.salaryCurrency,
    skills: this.skills,
    status: this.status,
    applicantCount: this.applicantCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Job = mongoose.model('Job', jobSchema);
