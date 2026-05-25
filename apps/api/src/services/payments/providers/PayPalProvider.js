import paypal from '@paypal/checkout-server-sdk';
import { config } from '../../../config/env.js';
import { ApiError } from '../../../utils/ApiError.js';
import { BasePaymentProvider } from './BasePaymentProvider.js';

export class PayPalProvider extends BasePaymentProvider {
  constructor() {
    super('paypal');
    if (config.PAYPAL_CLIENT_ID && config.PAYPAL_CLIENT_SECRET) {
      const Environment =
        config.PAYPAL_MODE === 'live' ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment;
      this.client = new paypal.core.PayPalHttpClient(
        new Environment(config.PAYPAL_CLIENT_ID, config.PAYPAL_CLIENT_SECRET)
      );
    } else {
      this.client = null;
    }
  }

  ensureConfigured() {
    if (!this.client) throw ApiError.badRequest('PayPal is not configured');
  }

  async createPayment({ order }) {
    this.ensureConfigured();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: order.orderNumber,
          amount: {
            currency_code: 'INR',
            value: order.pricing.total.toFixed(2)
          }
        }
      ]
    });
    const response = await this.client.execute(request);
    return {
      providerOrderId: response.result.id,
      clientPayload: response.result,
      rawPayload: response.result
    };
  }

  async verifyPayment({ payload }) {
    this.ensureConfigured();
    const request = new paypal.orders.OrdersCaptureRequest(payload.orderId);
    request.requestBody({});
    const response = await this.client.execute(request);
    if (response.result.status !== 'COMPLETED') throw ApiError.badRequest('PayPal payment has not completed');
    return {
      providerOrderId: response.result.id,
      providerPaymentId: response.result.purchase_units?.[0]?.payments?.captures?.[0]?.id,
      rawPayload: response.result
    };
  }

  async verifyWebhook() {
    return true;
  }

  async refundPayment() {
    throw ApiError.badRequest('PayPal refund adapter needs capture id wiring before use');
  }
}
