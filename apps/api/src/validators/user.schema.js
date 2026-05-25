import { z } from 'zod';
import { USER_ROLES } from '../constants/enums.js';
import { paginationQuerySchema } from './common.schema.js';

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().min(7).max(20).optional()
});

export const userListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  role: z.nativeEnum(USER_ROLES).optional(),
  isActive: z.enum(['true', 'false']).transform(value => value === 'true').optional()
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean().optional(),
  roles: z.array(z.nativeEnum(USER_ROLES)).optional()
});
