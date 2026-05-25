import { z } from 'zod';
import { COUPON_TYPES } from '../constants/enums.js';
import { objectIdSchema, paginationQuerySchema } from './common.schema.js';

export const couponCreateSchema = z.object({
  code: z.string().min(2).max(40),
  description: z.string().max(300).optional(),
  type: z.nativeEnum(COUPON_TYPES),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
  usageLimit: z.number().int().positive().optional(),
  userUsageLimit: z.number().int().positive().optional(),
  applicableProducts: z.array(objectIdSchema).optional(),
  applicableCategories: z.array(objectIdSchema).optional(),
  excludedProducts: z.array(objectIdSchema).optional(),
  isActive: z.boolean().optional()
});

export const couponUpdateSchema = couponCreateSchema.partial();

export const couponListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(value => value === 'true').optional()
});

export const couponValidateSchema = z.object({
  code: z.string().min(2).max(40),
  subtotal: z.number().min(0)
});
