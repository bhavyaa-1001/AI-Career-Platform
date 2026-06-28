import { z } from 'zod';

export const checkoutSchema = z.object({
  body: z.object({
    planSlug: z.enum(['starter', 'pro', 'enterprise']),
    couponCode: z.string().trim().optional(),
  }),
});

export const confirmCheckoutSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1),
  }),
});

export const cancelSubscriptionSchema = z.object({
  body: z.object({
    immediately: z.boolean().optional().default(false),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(40),
    planSlug: z.string().optional(),
  }),
});

export const referralCodeSchema = z.object({
  body: z.object({
    code: z.string().min(4).max(20),
  }),
});

export const preferencesSchema = z.object({
  body: z.object({
    language: z.string().max(10).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    privacy: z.object({
      profilePublic: z.boolean().optional(),
      showEmail: z.boolean().optional(),
      analyticsOptIn: z.boolean().optional(),
    }).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
      subscriptionRenewals: z.boolean().optional(),
      paymentSuccess: z.boolean().optional(),
      paymentFailed: z.boolean().optional(),
      trialEnding: z.boolean().optional(),
      upgradeSuggestions: z.boolean().optional(),
      referralUpdates: z.boolean().optional(),
    }).optional(),
  }),
});

export const billingAddressSchema = z.object({
  body: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    postalCode: z.string().min(1).max(20),
    country: z.string().length(2),
    taxId: z.string().max(50).optional(),
  }),
});

export const twoFactorTokenSchema = z.object({
  body: z.object({
    token: z.string().length(6),
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(8),
  }),
});

export const revokeSessionSchema = z.object({
  params: z.object({
    sessionId: z.string().min(1),
  }),
});

export const createApiKeySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(80),
    scopes: z.array(z.string()).optional(),
    rateLimit: z.number().int().min(100).max(100000).optional(),
  }),
});

export const createWebhookSchema = z.object({
  body: z.object({
    url: z.string().url(),
    events: z.array(z.string()).optional(),
  }),
});

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
  }),
});

export const inviteMemberSchema = z.object({
  params: z.object({ orgId: z.string().min(1) }),
  body: z.object({
    email: z.string().email(),
    role: z.enum(['admin', 'member', 'viewer']).optional(),
  }),
});

export const orgIdParamSchema = z.object({
  params: z.object({ orgId: z.string().min(1) }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(40),
    discountType: z.enum(['percent', 'fixed']),
    discountValue: z.number().positive(),
    maxRedemptions: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    applicablePlans: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updatePlanSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
    limits: z.record(z.union([z.number(), z.boolean()])).optional(),
    features: z.array(z.string()).optional(),
    trialDays: z.number().int().min(0).optional(),
    prioritySupport: z.boolean().optional(),
  }),
});

export const refundSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    amount: z.number().positive(),
    reason: z.string().max(500).optional(),
  }),
});
