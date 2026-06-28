import mongoose from 'mongoose';

export const RESUME_SECTIONS = [
  'personalInfo',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certificates',
  'achievements',
  'languages',
  'interests',
  'socialLinks',
];

export const RESUME_TEMPLATES = ['modern', 'corporate', 'minimal', 'developer', 'creative', 'classic', 'professional'];
export const RESUME_FONTS = ['Inter', 'Georgia', 'Helvetica', 'Times New Roman', 'Roboto', 'Merriweather'];
export const MAX_VERSIONS = 20;

const itemSchema = (fields) => new mongoose.Schema(fields, { _id: true });

const educationItem = itemSchema({
  institution: String,
  degree: String,
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  isCurrent: Boolean,
  grade: String,
  description: String,
});

const experienceItem = itemSchema({
  company: String,
  title: String,
  location: String,
  startDate: String,
  endDate: String,
  isCurrent: Boolean,
  description: String,
});

const projectItem = itemSchema({
  title: String,
  description: String,
  url: String,
  technologies: [String],
  startDate: String,
  endDate: String,
});

const skillItem = itemSchema({
  name: String,
  proficiency: String,
});

const certificateItem = itemSchema({
  name: String,
  issuer: String,
  issueDate: String,
  expiryDate: String,
  credentialId: String,
  url: String,
});

const achievementItem = itemSchema({
  title: String,
  description: String,
  date: String,
});

const languageItem = itemSchema({
  name: String,
  proficiency: String,
});

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100, default: 'Untitled Resume' },
    template: { type: String, enum: RESUME_TEMPLATES, default: 'modern' },
    settings: {
      fontFamily: { type: String, default: 'Inter' },
      primaryColor: { type: String, default: '#2563eb' },
      accentColor: { type: String, default: '#1e40af' },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      pageLayout: {
        type: String,
        enum: ['single', 'two-column', 'sidebar-left', 'sidebar-right'],
        default: 'sidebar-right',
      },
    },
    sectionOrder: {
      type: [String],
      default: () => [...RESUME_SECTIONS],
    },
    sectionVisibility: {
      type: mongoose.Schema.Types.Mixed,
      default: () =>
        Object.fromEntries(RESUME_SECTIONS.map((s) => [s, true])),
    },
    content: {
      personalInfo: {
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        headline: { type: String, default: '' },
        website: { type: String, default: '' },
      },
      summary: { text: { type: String, default: '' } },
      education: { type: [educationItem], default: [] },
      experience: { type: [experienceItem], default: [] },
      projects: { type: [projectItem], default: [] },
      skills: { type: [skillItem], default: [] },
      certificates: { type: [certificateItem], default: [] },
      achievements: { type: [achievementItem], default: [] },
      languages: { type: [languageItem], default: [] },
      interests: { type: [String], default: [] },
      socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        portfolio: { type: String, default: '' },
        twitter: { type: String, default: '' },
      },
    },
    isDefault: { type: Boolean, default: false },
    lastAutoSavedAt: { type: Date, default: null },
    importMeta: {
      sourceFileName: { type: String, default: null },
      sourceFileType: { type: String, enum: ['pdf', 'docx'], default: undefined },
      sourceFileUrl: { type: String, default: null },
      sourceFilePublicId: { type: String, default: null },
      importedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

resumeSchema.index({ userId: 1, updatedAt: -1 });

const mapSubdocs = (items) =>
  items.map((item) => {
    const { _id, ...rest } = item.toObject ? item.toObject() : item;
    return { id: _id?.toString(), ...rest };
  });

resumeSchema.methods.toSafeObject = function () {
  const c = this.content;
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    title: this.title,
    template: this.template,
    settings: this.settings,
    sectionOrder: this.sectionOrder,
    sectionVisibility: this.sectionVisibility,
    content: {
      personalInfo: { ...c.personalInfo },
      summary: { ...c.summary },
      education: mapSubdocs(c.education),
      experience: mapSubdocs(c.experience),
      projects: mapSubdocs(c.projects),
      skills: mapSubdocs(c.skills),
      certificates: mapSubdocs(c.certificates),
      achievements: mapSubdocs(c.achievements),
      languages: mapSubdocs(c.languages),
      interests: c.interests || [],
      socialLinks: { ...c.socialLinks },
    },
    isDefault: this.isDefault,
    lastAutoSavedAt: this.lastAutoSavedAt,
    importMeta: this.importMeta?.importedAt
      ? {
          sourceFileName: this.importMeta.sourceFileName,
          sourceFileType: this.importMeta.sourceFileType,
          sourceFileUrl: this.importMeta.sourceFileUrl,
          importedAt: this.importMeta.importedAt,
        }
      : null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Resume = mongoose.model('Resume', resumeSchema);
