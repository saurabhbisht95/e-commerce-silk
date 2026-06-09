import { z } from 'zod';
import { PRODUCT_STATUS } from '../constants/enums.js';
import { objectIdSchema, paginationQuerySchema } from './common.schema.js';

const booleanQuery = z
  .enum(['true', 'false'])
  .transform(value => value === 'true')
  .optional();

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
  position: z.number().int().min(0).optional()
});

const variantSchema = z.object({
  sku: z.string().min(1).max(80),
  size: z.string().max(40).optional(),
  color: z
    .object({
      name: z.string().optional(),
      hex: z.string().optional()
    })
    .optional(),
  price: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  reservedStock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  images: z.array(imageSchema).optional(),
  attributes: z.record(z.any()).optional(),
  isActive: z.boolean().optional()
});

export const productQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  category: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  categoryName: z.string().trim().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: booleanQuery,
  trending: booleanQuery,
  size: z.string().optional(),
  color: z.string().optional(),
  tags: z.preprocess(
    value => (typeof value === 'string' ? value.split(',').map(item => item.trim()).filter(Boolean) : value),
    z.array(z.string()).optional()
  ),
  status: z.nativeEnum(PRODUCT_STATUS).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'rating', 'popularity']).optional()
});

export const productCreateSchema = z.object({
  legacyId: z.number().int().positive().optional(),
  name: z.string().min(2).max(180),
  slug: z.string().optional(),
  sku: z.string().min(1).max(80),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  category: objectIdSchema,
  subcategories: z.array(objectIdSchema).optional(),
  brand: z.string().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  displayPrice: z.string().optional(),
  images: z.array(imageSchema).optional(),
  variants: z.array(variantSchema).optional(),
  stock: z.number().int().min(0).optional(),
  reservedStock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  inventoryPolicy: z.enum(['deny', 'continue']).optional(),
  attributes: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  flags: z
    .object({
      featured: z.boolean().optional(),
      trending: z.boolean().optional()
    })
    .optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional()
    })
    .optional(),
  status: z.nativeEnum(PRODUCT_STATUS).optional()
});

export const productUpdateSchema = productCreateSchema.partial();

export const stockAdjustSchema = z.object({
  variantSku: z.string().optional(),
  change: z.number().int(),
  reason: z.string().min(1).max(300)
});
