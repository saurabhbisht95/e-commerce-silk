import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().max(40).optional(),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  line1: z.string().min(3).max(180),
  line2: z.string().max(180).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postalCode: z.string().min(3).max(20),
  country: z.string().min(2).max(80).optional(),
  isDefault: z.boolean().optional()
});

export const addressUpdateSchema = addressSchema.partial();
