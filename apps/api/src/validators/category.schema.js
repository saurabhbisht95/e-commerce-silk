import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

export const categoryQuerySchema = z.object({
  tree: z.enum(['true', 'false']).transform(value => value === 'true').optional()
});

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().optional(),
  parent: objectIdSchema.nullable().optional(),
  description: z.string().optional(),
  image: z
    .object({
      url: z.string().url(),
      publicId: z.string().optional(),
      alt: z.string().optional()
    })
    .optional(),
  seo: z.record(z.any()).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
