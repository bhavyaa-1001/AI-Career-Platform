import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true, maxlength: 150 },
  degree: { type: String, required: true, trim: true, maxlength: 100 },
  fieldOfStudy: { type: String, trim: true, maxlength: 100 },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  isCurrent: { type: Boolean, default: false },
  grade: { type: String, trim: true, maxlength: 50 },
  description: { type: String, maxlength: 1000 },
});

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate',
  },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true, maxlength: 150 },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, trim: true, maxlength: 100 },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, maxlength: 2000 },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, maxlength: 2000 },
  url: { type: String, trim: true, maxlength: 500 },
  technologies: [{ type: String, trim: true, maxlength: 50 }],
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  issuer: { type: String, required: true, trim: true, maxlength: 150 },
  issueDate: { type: String, default: null },
  expiryDate: { type: String, default: null },
  credentialId: { type: String, trim: true, maxlength: 100 },
  url: { type: String, trim: true, maxlength: 500 },
});

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  proficiency: {
    type: String,
    enum: ['basic', 'conversational', 'fluent', 'native'],
    default: 'conversational',
  },
});

const expectedSalarySchema = new mongoose.Schema(
  {
    min: { type: Number, min: 0, default: null },
    max: { type: Number, min: 0, default: null },
    currency: { type: String, default: 'USD', maxlength: 3 },
    period: { type: String, enum: ['annual', 'monthly'], default: 'annual' },
  },
  { _id: false },
);

const socialLinksSchema = new mongoose.Schema(
  {
    twitter: { type: String, trim: true, maxlength: 500, default: '' },
    leetcode: { type: String, trim: true, maxlength: 500, default: '' },
    behance: { type: String, trim: true, maxlength: 500, default: '' },
    dribbble: { type: String, trim: true, maxlength: 500, default: '' },
    medium: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { _id: false },
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    location: { type: String, trim: true, maxlength: 100, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    headline: { type: String, maxlength: 120, default: '' },
    resumeUrl: { type: String, trim: true, maxlength: 500, default: '' },
    github: { type: String, trim: true, maxlength: 500, default: '' },
    linkedin: { type: String, trim: true, maxlength: 500, default: '' },
    portfolio: { type: String, trim: true, maxlength: 500, default: '' },
    preferredRoles: [{ type: String, trim: true, maxlength: 80 }],
    expectedSalary: { type: expectedSalarySchema, default: () => ({}) },
    languages: { type: [languageSchema], default: [] },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    education: { type: [educationSchema], default: [] },
    skills: { type: [skillSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    projects: { type: [projectSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    draft: { type: mongoose.Schema.Types.Mixed, default: null },
    hasDraft: { type: Boolean, default: false },
    lastDraftSavedAt: { type: Date, default: null },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
);

profileSchema.methods.toSafeObject = function () {
  const mapItem = (item) => {
    const { _id, ...rest } = item.toObject();
    return { id: _id.toString(), ...rest };
  };

  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    phone: this.phone,
    location: this.location,
    bio: this.bio,
    headline: this.headline,
    resumeUrl: this.resumeUrl,
    github: this.github,
    linkedin: this.linkedin,
    portfolio: this.portfolio,
    preferredRoles: this.preferredRoles,
    expectedSalary: this.expectedSalary,
    languages: this.languages.map(mapItem),
    socialLinks: this.socialLinks,
    education: this.education.map(mapItem),
    skills: this.skills.map(mapItem),
    experience: this.experience.map(mapItem),
    projects: this.projects.map(mapItem),
    certifications: this.certifications.map(mapItem),
    hasDraft: this.hasDraft,
    lastDraftSavedAt: this.lastDraftSavedAt,
    isPublished: this.isPublished,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Profile = mongoose.model('Profile', profileSchema);
