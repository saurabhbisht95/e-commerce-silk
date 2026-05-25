import { z } from 'zod';

export const salesAnalyticsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  groupBy: z.enum(['day', 'month']).optional()
});
