import { z } from 'zod';
import { REVIEW_STATUS } from '../constants/enums.js';

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
  order: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        publicId: z.string().optional(),
        alt: z.string().optional()
      })
    )
    .optional()
});

export const reviewUpdateSchema = reviewCreateSchema.partial();

export const reviewModerationSchema = z.object({
  status: z.nativeEnum(REVIEW_STATUS),
  response: z
    .object({
      comment: z.string().max(1000),
      respondedAt: z.coerce.date().optional()
    })
    .optional()
});
