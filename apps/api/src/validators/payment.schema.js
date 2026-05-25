import { z } from 'zod';
import { PAYMENT_PROVIDERS } from '../constants/enums.js';
import { objectIdSchema } from './common.schema.js';

export const createPaymentSchema = z.object({
  orderId: objectIdSchema,
  provider: z.enum([PAYMENT_PROVIDERS.STRIPE, PAYMENT_PROVIDERS.RAZORPAY, PAYMENT_PROVIDERS.PAYPAL])
});

export const verifyPaymentSchema = z.object({
  provider: z.enum([PAYMENT_PROVIDERS.STRIPE, PAYMENT_PROVIDERS.RAZORPAY, PAYMENT_PROVIDERS.PAYPAL]),
  payload: z.record(z.any())
});

export const refundPaymentSchema = z.object({
  orderId: objectIdSchema,
  amount: z.number().min(0).optional(),
  reason: z.string().min(3).max(300).optional()
});
