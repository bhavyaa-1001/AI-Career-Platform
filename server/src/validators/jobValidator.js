import { z } from 'zod';

const jobBody = {
  title: z.string().min(1).max(120),
  description: z.string().min(20).max(8000),
  requirements: z.string().max(4000).optional(),
  responsibilities: z.string().max(4000).optional(),
  location: z.string().max(120).optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'remote']).optional(),
  salaryMin: z.coerce.number().min(0).nullable().optional(),
  salaryMax: z.coerce.number().min(0).nullable().optional(),
  salaryCurrency: z.string().max(3).optional(),
  skills: z.array(z.string().max(60)).max(20).optional(),
  status: z.enum(['draft', 'open', 'closed']).optional(),
};

export const createJobSchema = z.object({
  body: z.object(jobBody),
});

export const updateJobSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object(jobBody).partial(),
});

export const jobIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const listJobsSchema = z.object({
  query: z.object({
    status: z.enum(['draft', 'open', 'closed', 'all']).optional().default('all'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }).optional().default({}),
});

export const applyJobSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    resumeId: z.string().min(1),
    coverLetter: z.string().max(8000).optional(),
  }),
});

export const listOpenJobsSchema = z.object({
  query: z.object({
    search: z.string().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }).optional().default({}),
});
