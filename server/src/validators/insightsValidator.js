import { z } from 'zod';

export const insightsQuerySchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const exportQuerySchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    format: z.enum(['csv', 'pdf']).default('csv'),
  }),
});
