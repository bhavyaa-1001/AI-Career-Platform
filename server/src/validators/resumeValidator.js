import { z } from 'zod';

const optionalUrl = z.union([
  z.string().url(),
  z.literal(''),
  z.string().max(500),
]).optional();

const personalInfoSchema = z.object({
  fullName: z.string().max(100).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  headline: z.string().max(120).optional(),
  website: optionalUrl,
});

export const contentSchema = z.object({
  personalInfo: personalInfoSchema.optional(),
  summary: z.object({ text: z.string().max(2000).optional() }).optional(),
  education: z.array(z.record(z.unknown())).optional(),
  experience: z.array(z.record(z.unknown())).optional(),
  projects: z.array(z.record(z.unknown())).optional(),
  skills: z.array(z.record(z.unknown())).optional(),
  certificates: z.array(z.record(z.unknown())).optional(),
  achievements: z.array(z.record(z.unknown())).optional(),
  languages: z.array(z.record(z.unknown())).optional(),
  interests: z.array(z.string().max(80)).optional(),
  socialLinks: z
    .object({
      github: optionalUrl,
      linkedin: optionalUrl,
      portfolio: optionalUrl,
      twitter: optionalUrl,
    })
    .optional(),
});

const templateEnum = z.enum(['modern', 'corporate', 'minimal', 'developer', 'creative', 'classic', 'professional']);

export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    template: templateEnum.optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateResumeSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    template: templateEnum.optional(),
    settings: z
      .object({
        fontFamily: z.string().max(50).optional(),
        primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        fontSize: z.enum(['small', 'medium', 'large']).optional(),
        pageLayout: z.enum(['single', 'two-column', 'sidebar-left', 'sidebar-right']).optional(),
      })
      .optional(),
    sectionOrder: z.array(z.string()).optional(),
    sectionVisibility: z.record(z.boolean()).optional(),
    content: contentSchema.optional(),
    isDefault: z.boolean().optional(),
    versionLabel: z.string().min(1).max(100).optional(),
  }),
});

export const autosaveResumeSchema = updateResumeSchema;

export const resumeIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const versionIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    versionId: z.string().min(1),
  }),
});

export const importProfileSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
  }),
});

const importContentSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().max(100).optional(),
    email: z.string().max(120).optional(),
    phone: z.string().max(30).optional(),
    location: z.string().max(100).optional(),
    headline: z.string().max(120).optional(),
    website: z.string().max(200).optional(),
  }).optional(),
  summary: z.object({ text: z.string().max(5000).optional() }).optional(),
  education: z.array(z.record(z.unknown())).optional(),
  experience: z.array(z.record(z.unknown())).optional(),
  projects: z.array(z.record(z.unknown())).optional(),
  skills: z.array(z.record(z.unknown())).optional(),
  certificates: z.array(z.record(z.unknown())).optional(),
  achievements: z.array(z.record(z.unknown())).optional(),
  languages: z.array(z.record(z.unknown())).optional(),
  interests: z.array(z.string()).optional(),
  socialLinks: z.record(z.string()).optional(),
});

export const exportPdfSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    template: templateEnum.optional(),
    settings: updateResumeSchema.shape.body.shape.settings.optional(),
    sectionOrder: z.array(z.string()).optional(),
    sectionVisibility: z.record(z.boolean()).optional(),
    content: contentSchema.optional(),
  }).optional().default({}),
});

export const importSaveSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    template: templateEnum.optional(),
    content: importContentSchema,
    importMeta: z.object({
      sourceFileName: z.string().max(255).optional(),
      sourceFileType: z.enum(['pdf', 'docx']).optional(),
      sourceFileUrl: z.string().url().nullable().optional(),
      sourceFilePublicId: z.string().max(255).nullable().optional(),
    }).optional(),
  }),
});
