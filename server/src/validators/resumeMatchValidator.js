import { z } from 'zod';

export const generateMatchSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1),
    jobTitle: z.string().max(120).optional(),
    companyName: z.string().max(120).optional(),
    jobDescription: z.string().min(30).max(8000),
  }),
});

export const matchIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listMatchesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }).optional().default({}),
});
