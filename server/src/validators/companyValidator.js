import { z } from 'zod';

const companyFields = {
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  website: z.string().max(200).optional(),
  logoUrl: z.string().max(500).optional(),
  industry: z.string().max(80).optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', '']).optional(),
  location: z.string().max(120).optional(),
  foundedYear: z.coerce.number().int().min(1800).max(2100).nullable().optional(),
};

export const upsertCompanySchema = z.object({
  body: z.object(companyFields),
});

export const updateCompanySchema = z.object({
  body: z.object(companyFields).partial(),
});
