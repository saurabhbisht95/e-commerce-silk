import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';
import { authenticate, authorizeAtLeast } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { createPaymentSchema, refundPaymentSchema, verifyPaymentSchema } from '../validators/payment.schema.js';

const router = Router();

router.post('/', authenticate, validate({ body: createPaymentSchema }), paymentController.create);
router.post('/verify', authenticate, validate({ body: verifyPaymentSchema }), paymentController.verify);
router.post(
  '/refund',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ body: refundPaymentSchema }),
  paymentController.refund
);

export default router;
