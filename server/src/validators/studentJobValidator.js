import { z } from 'zod';

export const browseJobsSchema = z.object({
  query: z.object({
    search: z.string().max(100).optional(),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
    location: z.string().max(120).optional(),
    skill: z.string().max(60).optional(),
    salaryMin: z.coerce.number().min(0).optional(),
    bookmarkedOnly: z.coerce.boolean().optional(),
    sort: z.enum(['recent', 'salary', 'applicants']).optional().default('recent'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }).optional().default({}),
});

export const listBookmarksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }).optional().default({}),
});

export const bookmarkJobSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const studentApplicationIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listStudentApplicationsSchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'shortlisted', 'rejected', 'accepted', 'all']).optional().default('all'),
    trackStatus: z.enum(['applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn', 'all']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  }).optional().default({}),
});
