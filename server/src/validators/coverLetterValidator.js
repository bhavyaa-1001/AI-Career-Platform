import { z } from 'zod';

const toneEnum = z.enum(['professional', 'confident', 'friendly', 'formal', 'enthusiastic']);
const lengthEnum = z.enum(['short', 'medium', 'long']);

export const generateCoverLetterSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1),
    jobDescription: z.string().min(20).max(8000),
    company: z.string().min(1).max(120),
    role: z.string().min(1).max(120),
    tone: toneEnum.optional().default('professional'),
    length: lengthEnum.optional().default('medium'),
  }),
});

export const coverLetterIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const updateCoverLetterSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    body: z.string().min(1).max(12000),
  }),
});

export const listCoverLettersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(30),
  }).optional().default({}),
});

export { toneEnum, lengthEnum };
