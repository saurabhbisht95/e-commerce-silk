import Stripe from 'stripe';
import { config } from '../../../config/env.js';
import { ApiError } from '../../../utils/ApiError.js';
import { BasePaymentProvider } from './BasePaymentProvider.js';

export class StripeProvider extends BasePaymentProvider {
  constructor() {
    super('stripe');
    this.client = config.STRIPE_SECRET_KEY ? new Stripe(config.STRIPE_SECRET_KEY) : null;
  }

  ensureConfigured() {
    if (!this.client) throw ApiError.badRequest('Stripe is not configured');
  }

  async createPayment({ order }) {
    this.ensureConfigured();
    const intent = await this.client.paymentIntents.create({
      amount: Math.round(order.pricing.total * 100),
      currency: 'inr',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber
      },
      automatic_payment_methods: { enabled: true }
    });
    return {
      providerPaymentId: intent.id,
      clientPayload: { clientSecret: intent.client_secret },
      rawPayload: intent
    };
  }

  async verifyPayment({ payload }) {
    this.ensureConfigured();
    const intent = await this.client.paymentIntents.retrieve(payload.paymentIntentId);
    if (intent.status !== 'succeeded') throw ApiError.badRequest('Stripe payment has not succeeded');
    return {
      providerPaymentId: intent.id,
      rawPayload: intent
    };
  }

  async verifyWebhook({ rawBody, signature }) {
    this.ensureConfigured();
    return this.client.webhooks.constructEvent(rawBody, signature, config.STRIPE_WEBHOOK_SECRET);
  }

  async refundPayment({ paymentId, amount }) {
    this.ensureConfigured();
    return this.client.refunds.create({
      payment_intent: paymentId,
      amount: Math.round(amount * 100)
    });
  }
}
