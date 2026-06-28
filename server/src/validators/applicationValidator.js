import { z } from 'zod';

export const applicationIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const jobApplicationsSchema = z.object({
  params: z.object({ jobId: z.string().min(1) }),
  query: z.object({
    status: z.enum(['pending', 'shortlisted', 'rejected', 'accepted', 'all']).optional().default('all'),
    sort: z.enum(['ranking', 'recent']).optional().default('ranking'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(30),
  }).optional().default({}),
});

export const updateApplicationSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['pending', 'shortlisted', 'rejected', 'accepted']).optional(),
    notes: z.string().max(2000).optional(),
  }),
});
