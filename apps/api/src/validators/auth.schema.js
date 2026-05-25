import { z } from 'zod';

const password = z.string().min(8).max(128);

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional(),
  password
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: password
});
