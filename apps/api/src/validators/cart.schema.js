import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

export const guestQuerySchema = z.object({
  guestId: z.string().min(6).max(120).optional()
});

export const cartItemSchema = z.object({
  productId: objectIdSchema,
  variantSku: z.string().optional(),
  quantity: z.number().int().min(1).max(99)
});

export const removeCartItemSchema = z.object({
  productId: objectIdSchema,
  variantSku: z.string().optional()
});

export const couponApplySchema = z.object({
  code: z.string().min(2).max(40)
});

export const mergeCartSchema = z.object({
  guestId: z.string().min(6).max(120)
});
