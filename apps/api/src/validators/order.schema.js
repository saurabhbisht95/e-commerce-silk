import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_PROVIDERS } from '../constants/enums.js';
import { objectIdSchema, paginationQuerySchema } from './common.schema.js';
import { addressSchema } from './address.schema.js';

export const orderCreateSchema = z.object({
  addressId: objectIdSchema.optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  paymentProvider: z.nativeEnum(PAYMENT_PROVIDERS).optional(),
  idempotencyKey: z.string().max(120).optional()
});

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(ORDER_STATUS).optional(),
  user: objectIdSchema.optional(),
  search: z.string().optional()
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3).max(300)
});

export const returnOrderSchema = z.object({
  reason: z.string().min(3).max(300)
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(ORDER_STATUS),
  note: z.string().max(300).optional()
});
