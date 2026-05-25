import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller.js';

const router = Router();

router.post('/:provider', paymentController.webhook);

export default router;
