import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from '../validators/auth.schema.js';

const router = Router();

router.post('/register', authRateLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh-token', validate({ body: refreshSchema }), authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authRateLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
router.post('/verify-email', validate({ body: verifyEmailSchema }), authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerification);
router.patch('/change-password', authenticate, validate({ body: changePasswordSchema }), authController.changePassword);
router.get('/me', authenticate, authController.me);
router.get('/google', authController.googleOAuthReady);
router.get('/google/callback', authController.googleOAuthReady);

export default router;
