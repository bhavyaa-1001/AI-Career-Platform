import { z } from 'zod';

import { contentSchema } from './resumeValidator.js';

const rewriteModeEnum = z.enum([
  'summary',
  'experience',
  'projects',
  'achievements',
  'grammar',
  'actionVerbs',
  'keywords',
]);

export const rewriteResumeSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    mode: rewriteModeEnum,
    itemId: z.string().optional(),
    targetRole: z.string().max(120).optional(),
    targetJobDescription: z.string().max(5000).optional(),
  }),
});

export const applyRewriteSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    content: contentSchema,
    versionLabel: z.string().min(1).max(100),
  }),
});
