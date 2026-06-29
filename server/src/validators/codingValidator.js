import { z } from 'zod';

import {
  CODING_LANGUAGES, CONTEST_STATUSES, PROBLEM_CATEGORIES, PROBLEM_DIFFICULTIES, PROBLEM_STATUSES,
} from '../config/codingConstants.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const testCaseSchema = z.object({
  input: z.string().min(1).max(10000),
  output: z.string().min(1).max(10000),
  explanation: z.string().max(2000).optional(),
});

const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

export const listProblemsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    difficulty: z.enum(PROBLEM_DIFFICULTIES).optional(),
    category: z.enum(PROBLEM_CATEGORIES).optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    status: z.enum([...PROBLEM_STATUSES, 'all']).optional(),
  }),
});

export const slugParamSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const createProblemSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    slug: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(20000),
    difficulty: z.enum(PROBLEM_DIFFICULTIES),
    category: z.enum(PROBLEM_CATEGORIES).default('other'),
    tags: z.array(z.string()).default([]),
    constraints: z.string().max(4000).optional(),
    inputFormat: z.string().max(4000).optional(),
    outputFormat: z.string().max(4000).optional(),
    sampleTestCases: z.array(testCaseSchema).min(1),
    hiddenTestCases: z.array(testCaseSchema).default([]),
    hints: z.array(z.string()).default([]),
    editorial: z.string().max(20000).optional(),
    starterCode: z.record(z.enum(CODING_LANGUAGES), z.string()).optional(),
    supportedLanguages: z.array(z.enum(CODING_LANGUAGES)).optional(),
    timeLimitMs: z.number().int().min(500).max(30000).optional(),
    memoryLimitKb: z.number().int().min(65536).max(524288).optional(),
    companies: z.array(z.string()).default([]),
    points: z.number().int().min(1).max(1000).optional(),
    status: z.enum(PROBLEM_STATUSES).default('draft'),
  }),
});

export const updateProblemSchema = z.object({
  params: z.object({ id: objectId }),
  body: createProblemSchema.shape.body.partial(),
});

export const runCodeSchema = z.object({
  body: z.object({
    problemId: objectId.optional(),
    slug: z.string().optional(),
    language: z.enum(CODING_LANGUAGES),
    sourceCode: z.string().min(1).max(50000),
  }).refine((d) => d.problemId || d.slug, { message: 'problemId or slug required' }),
});

export const submitCodeSchema = z.object({
  body: z.object({
    problemId: objectId.optional(),
    slug: z.string().optional(),
    language: z.enum(CODING_LANGUAGES),
    sourceCode: z.string().min(1).max(50000),
    contestId: objectId.optional().nullable(),
  }).refine((d) => d.problemId || d.slug, { message: 'problemId or slug required' }),
});

export const saveDraftSchema = z.object({
  body: z.object({
    problemId: objectId,
    language: z.enum(CODING_LANGUAGES),
    sourceCode: z.string().min(1).max(50000),
  }),
});

export const draftParamSchema = z.object({
  params: z.object({ problemId: objectId }),
});

export const listSubmissionsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    problemId: objectId.optional(),
  }),
});

export const bookmarkToggleSchema = z.object({
  body: z.object({ problemId: objectId }),
});

export const listBookmarksSchema = z.object({
  query: z.object({
    ...paginationQuery,
    type: z.enum(['bookmarked', 'favorite', 'solved', 'recent']).default('bookmarked'),
  }),
});

export const leaderboardSchema = z.object({
  query: z.object({
    period: z.enum(['global', 'weekly', 'monthly']).default('global'),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

export const codeReviewSchema = z.object({
  body: z.object({
    problemId: objectId,
    submissionId: objectId.optional(),
    language: z.enum(CODING_LANGUAGES),
    sourceCode: z.string().min(1).max(50000),
  }),
});

export const hintSchema = z.object({
  body: z.object({
    problemId: objectId,
    level: z.number().int().min(1).max(4),
  }),
});

export const dryRunSchema = z.object({
  body: z.object({
    problemId: objectId,
    language: z.enum(CODING_LANGUAGES),
    sourceCode: z.string().min(1).max(50000),
  }),
});

export const visualHintSchema = z.object({
  body: z.object({
    problemId: objectId,
  }),
});

export const hintSessionSchema = z.object({
  params: z.object({ problemId: objectId }),
});

export const createContestSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200),
    slug: z.string().min(3).max(200).optional(),
    description: z.string().max(8000).optional(),
    problemIds: z.array(objectId).min(1),
    startTime: z.string().datetime(),
    durationMinutes: z.number().int().min(30).max(1440),
    isVirtual: z.boolean().optional(),
    maxParticipants: z.number().int().min(1).optional(),
  }),
});

export const updateContestSchema = z.object({
  params: z.object({ id: objectId }),
  body: createContestSchema.shape.body.partial(),
});

export const listContestsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    status: z.enum(CONTEST_STATUSES).optional(),
  }),
});

export const listReviewsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    problemId: objectId.optional(),
  }),
});
