import { paymentService } from '../services/payment/payment.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const paymentController = {
  create: asyncHandler(async (req, res) => {
    const result = await paymentService.createPayment({
      orderId: req.body.orderId,
      provider: req.body.provider,
      userId: req.user._id,
      idempotencyKey: req.headers['idempotency-key']
    });
    sendCreated(res, 'Payment initialized successfully', result);
  }),

  verify: asyncHandler(async (req, res) => {
    const result = await paymentService.verifyPayment({
      provider: req.body.provider,
      payload: req.body.payload,
      userId: req.user._id
    });
    sendSuccess(res, 200, 'Payment verified successfully', result);
  }),

  webhook: asyncHandler(async (req, res) => {
    const signature =
      req.headers['stripe-signature'] ||
      req.headers['x-razorpay-signature'] ||
      req.headers['paypal-transmission-sig'];
    const result = await paymentService.handleWebhook({
      provider: req.params.provider,
      rawBody: req.body,
      signature
    });
    sendSuccess(res, 200, 'Webhook accepted', result);
  }),

  refund: asyncHandler(async (req, res) => {
    const result = await paymentService.refund({
      orderId: req.body.orderId,
      amount: req.body.amount,
      reason: req.body.reason,
      actorId: req.user._id
    });
    sendSuccess(res, 200, 'Refund processed successfully', result);
  })
};
