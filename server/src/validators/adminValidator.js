import { z } from 'zod';

import { ROLES } from '../models/User.js';
import { CMS_TYPES } from '../models/admin/CmsContent.js';
import { REPORT_TYPES, REPORT_STATUSES } from '../models/admin/Report.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
};

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const userIdParamSchema = z.object({
  params: z.object({ userId: objectId }),
});

export const listUsersSchema = z.object({
  query: z.object({
    ...pagination,
    role: z.enum(ROLES).optional(),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
    isBanned: z.enum(['true', 'false']).optional(),
    isSuspended: z.enum(['true', 'false']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(ROLES).default('student'),
    isEmailVerified: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    role: z.enum(ROLES).optional(),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
  }),
});

export const suspendUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    reason: z.string().max(500).optional(),
    until: z.string().datetime().optional(),
  }).optional(),
});

export const banUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ reason: z.string().max(500).optional() }).optional(),
});

export const assignRoleSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ role: z.enum(ROLES) }),
});

export const resetPasswordSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ newPassword: z.string().min(8) }),
});

export const bulkActionSchema = z.object({
  body: z.object({
    userIds: z.array(objectId).min(1),
    action: z.enum(['suspend', 'activate', 'ban', 'delete']),
    data: z.object({ reason: z.string().optional() }).optional(),
  }),
});

export const listRecruitersSchema = z.object({
  query: z.object({
    ...pagination,
    search: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
    kycStatus: z.enum(['not_started', 'pending', 'verified', 'rejected']).optional(),
    premiumStatus: z.enum(['none', 'basic', 'premium', 'enterprise']).optional(),
  }),
});

export const recruiterActionSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({ reason: z.string().max(500).optional() }).optional(),
});

export const listJobsSchema = z.object({
  query: z.object({
    ...pagination,
    status: z.enum(['draft', 'open', 'closed']).optional(),
    search: z.string().optional(),
    featured: z.enum(['true', 'false']).optional(),
    moderationStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
    adminStatus: z.enum(['active', 'featured', 'expired', 'archived']).optional(),
  }),
});

export const listResumesSchema = z.object({
  query: z.object({
    ...pagination,
    userId: objectId.optional(),
    search: z.string().optional(),
    adminStatus: z.enum(['active', 'deleted', 'archived']).optional(),
  }),
});

export const listCmsSchema = z.object({
  query: z.object({
    ...pagination,
    type: z.enum(CMS_TYPES).optional(),
    isPublished: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
  }),
});

export const createCmsSchema = z.object({
  body: z.object({
    type: z.enum(CMS_TYPES),
    title: z.string().min(1).max(300),
    slug: z.string().max(200).optional(),
    content: z.string().optional(),
    excerpt: z.string().max(500).optional(),
    author: z.string().max(100).optional(),
    imageUrl: z.string().max(500).optional(),
    isPublished: z.boolean().optional(),
    sortOrder: z.number().optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateCmsSchema = z.object({
  params: z.object({ id: objectId }),
  body: createCmsSchema.shape.body.partial(),
});

export const createBroadcastSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(2000),
    channels: z.array(z.enum(['in_app', 'email', 'push'])).optional(),
    targetRoles: z.array(z.enum(ROLES)).optional(),
    link: z.string().max(300).optional(),
    sendNow: z.boolean().optional(),
    scheduledAt: z.string().datetime().optional(),
  }),
});

export const listReportsSchema = z.object({
  query: z.object({
    ...pagination,
    type: z.enum(REPORT_TYPES).optional(),
    status: z.enum(REPORT_STATUSES).optional(),
  }),
});

export const resolveReportSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    resolution: z.string().max(1000).optional(),
    status: z.enum(REPORT_STATUSES).optional(),
  }),
});

export const listAuditSchema = z.object({
  query: z.object({
    ...pagination,
    action: z.string().optional(),
    actorId: objectId.optional(),
    resource: z.string().optional(),
    search: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const updateSettingsSchema = z.object({
  params: z.object({
    category: z.enum(['global', 'email', 'cloudinary', 'gemini', 'jwt', 'branding', 'maintenance', 'features']),
  }),
  body: z.record(z.unknown()),
});

export const createQuestionSchema = z.object({
  body: z.object({
    question: z.string().min(1).max(2000),
    category: z.enum(['technical', 'behavioral', 'system_design', 'coding', 'general']).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    tags: z.array(z.string()).optional(),
    sampleAnswer: z.string().max(5000).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    category: z.enum(['technical', 'behavioral', 'system_design', 'general']).optional(),
    description: z.string().max(1000).optional(),
    prompt: z.string().max(5000).optional(),
    duration: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const dateRangeSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const listPaginationSchema = z.object({
  query: z.object({ ...pagination }),
});
