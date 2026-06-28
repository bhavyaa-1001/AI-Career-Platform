import { z } from 'zod';

export const analyzeUploadSchema = z.object({
  body: z.object({
    targetRole: z.string().max(120).optional(),
    targetJobDescription: z.string().max(5000).optional(),
  }).optional().default({}),
});

export const analyzeResumeSchema = z.object({
  params: z.object({ resumeId: z.string().min(1) }),
  body: z.object({
    targetRole: z.string().max(120).optional(),
    targetJobDescription: z.string().max(5000).optional(),
  }).optional().default({}),
});

export const analysisIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listAnalysesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }).optional().default({}),
});
