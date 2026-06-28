import { z } from 'zod';

const optionalUrl = z
  .string()
  .url('Must be a valid URL')
  .or(z.literal(''))
  .optional();

const monthString = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM format')
  .or(z.literal(''))
  .optional();

export const personalDetailsSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phone: z.string().max(20).optional(),
    location: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    headline: z.string().max(120).optional(),
    resumeUrl: optionalUrl,
    github: optionalUrl,
    linkedin: optionalUrl,
    portfolio: optionalUrl,
    preferredRoles: z.array(z.string().max(80)).max(10).optional(),
    expectedSalary: z
      .object({
        min: z.number().min(0).nullable().optional(),
        max: z.number().min(0).nullable().optional(),
        currency: z.string().max(3).optional(),
        period: z.enum(['annual', 'monthly']).optional(),
      })
      .optional(),
    socialLinks: z
      .object({
        twitter: optionalUrl,
        leetcode: optionalUrl,
        behance: optionalUrl,
        dribbble: optionalUrl,
        medium: optionalUrl,
      })
      .optional(),
  }),
});

export const skillsSchema = z.object({
  body: z.object({
    skills: z
      .array(
        z.object({
          name: z.string().min(1, 'Skill name is required').max(80),
          proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
        }),
      )
      .max(50, 'Maximum 50 skills allowed'),
  }),
});

export const educationSchema = z.object({
  body: z.object({
    institution: z.string().min(1, 'Institution is required').max(150),
    degree: z.string().min(1, 'Degree is required').max(100),
    fieldOfStudy: z.string().max(100).optional(),
    startDate: monthString,
    endDate: monthString,
    isCurrent: z.boolean().optional().default(false),
    grade: z.string().max(50).optional(),
    description: z.string().max(1000).optional(),
  }),
});

export const experienceSchema = z.object({
  body: z.object({
    company: z.string().min(1, 'Company is required').max(150),
    title: z.string().min(1, 'Title is required').max(100),
    location: z.string().max(100).optional(),
    startDate: monthString,
    endDate: monthString,
    isCurrent: z.boolean().optional().default(false),
    description: z.string().max(2000).optional(),
  }),
});

export const projectSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(150),
    description: z.string().max(2000).optional(),
    url: optionalUrl,
    technologies: z.array(z.string().max(50)).max(20).optional().default([]),
    startDate: monthString,
    endDate: monthString,
  }),
});

export const certificationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Certification name is required').max(150),
    issuer: z.string().min(1, 'Issuer is required').max(150),
    issueDate: monthString,
    expiryDate: monthString,
    credentialId: z.string().max(100).optional(),
    url: optionalUrl,
  }),
});

export const languagesSchema = z.object({
  body: z.object({
    languages: z
      .array(
        z.object({
          name: z.string().min(1).max(80),
          proficiency: z.enum(['basic', 'conversational', 'fluent', 'native']).default('conversational'),
        }),
      )
      .max(20),
  }),
});

export const careerPreferencesSchema = z.object({
  body: z.object({
    preferredRoles: z.array(z.string().max(80)).max(10).optional(),
    expectedSalary: z
      .object({
        min: z.number().min(0).nullable().optional(),
        max: z.number().min(0).nullable().optional(),
        currency: z.string().max(3).optional(),
        period: z.enum(['annual', 'monthly']).optional(),
      })
      .optional(),
  }),
});

export const socialLinksSchema = z.object({
  body: z.object({
    twitter: optionalUrl,
    leetcode: optionalUrl,
    behance: optionalUrl,
    dribbble: optionalUrl,
    medium: optionalUrl,
  }),
});

export const draftSchema = z.object({
  body: z.record(z.unknown()),
});

export const itemIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
});

export const updateEducationSchema = z.object({
  params: itemIdSchema.shape.params,
  body: educationSchema.shape.body,
});

export const updateExperienceSchema = z.object({
  params: itemIdSchema.shape.params,
  body: experienceSchema.shape.body,
});

export const updateProjectSchema = z.object({
  params: itemIdSchema.shape.params,
  body: projectSchema.shape.body,
});

export const updateCertificationSchema = z.object({
  params: itemIdSchema.shape.params,
  body: certificationSchema.shape.body,
});
