import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config } from '../../../config/env.js';
import { ApiError } from '../../../utils/ApiError.js';
import { BasePaymentProvider } from './BasePaymentProvider.js';

export class RazorpayProvider extends BasePaymentProvider {
  constructor() {
    super('razorpay');
    this.client =
      config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET
        ? new Razorpay({
            key_id: config.RAZORPAY_KEY_ID,
            key_secret: config.RAZORPAY_KEY_SECRET
          })
        : null;
  }

  ensureConfigured() {
    if (!this.client) throw ApiError.badRequest('Razorpay is not configured');
  }

  async createPayment({ order }) {
    this.ensureConfigured();
    const paymentOrder = await this.client.orders.create({
      amount: Math.round(order.pricing.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString() }
    });
    return {
      providerOrderId: paymentOrder.id,
      clientPayload: {
        key: config.RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        orderId: paymentOrder.id
      },
      rawPayload: paymentOrder
    };
  }

  async verifyPayment({ payload }) {
    const signature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
      .digest('hex');

    if (signature !== payload.razorpay_signature) {
      throw ApiError.badRequest('Razorpay payment verification failed');
    }

    return {
      providerOrderId: payload.razorpay_order_id,
      providerPaymentId: payload.razorpay_payment_id,
      rawPayload: payload
    };
  }

  async verifyWebhook({ rawBody, signature }) {
    const expected = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET).update(rawBody).digest('hex');
    if (expected !== signature) throw ApiError.badRequest('Invalid Razorpay webhook signature');
    return true;
  }

  async refundPayment({ paymentId, amount }) {
    this.ensureConfigured();
    return this.client.payments.refund(paymentId, { amount: Math.round(amount * 100) });
  }
}
