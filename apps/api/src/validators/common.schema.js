import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ObjectId');

export const idParamSchema = z.object({
  id: objectIdSchema
});

export const slugOrIdParamSchema = z.object({
  slugOrId: z.string().min(1)
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional()
});
