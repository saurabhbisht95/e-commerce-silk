import { z } from 'zod';

const bannerImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().max(140).optional()
});

export const bannerQuerySchema = z.object({
  includeInactive: z
    .enum(['true', 'false'])
    .transform(value => value === 'true')
    .optional()
});

export const bannerCreateSchema = z.object({
  headline: z.array(z.string().trim().min(1).max(80)).min(1).max(3),
  subtext: z.string().trim().max(240).optional(),
  cta: z.string().trim().min(1).max(60).optional(),
  ctaHref: z.string().trim().min(1).max(160).optional(),
  modelImage: bannerImageSchema,
  sideImage: bannerImageSchema.optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional()
});

export const bannerUpdateSchema = bannerCreateSchema.partial();
