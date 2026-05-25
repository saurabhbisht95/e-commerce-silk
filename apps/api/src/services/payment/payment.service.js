import { Order } from '../../models/Order.js';
import { PaymentTransaction } from '../../models/PaymentTransaction.js';
import { ORDER_STATUS, PAYMENT_PROVIDERS, PAYMENT_STATUS } from '../../constants/enums.js';
import { ApiError } from '../../utils/ApiError.js';
import { paymentProviderFactory } from '../payments/PaymentProviderFactory.js';

export const paymentService = {
  async createPayment({ orderId, provider, userId, idempotencyKey }) {
    const order = await Order.findOne({ _id: orderId, user: userId, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');
    if (provider === PAYMENT_PROVIDERS.COD) throw ApiError.badRequest('COD orders do not need online payment');

    const adapter = paymentProviderFactory.get(provider);
    const providerResponse = await adapter.createPayment({ order });

    const transaction = await PaymentTransaction.create({
      order: order._id,
      user: userId,
      provider,
      amount: order.pricing.total,
      currency: 'INR',
      providerOrderId: providerResponse.providerOrderId,
      providerPaymentId: providerResponse.providerPaymentId,
      rawPayload: providerResponse.rawPayload,
      idempotencyKey
    });

    order.payment.provider = provider;
    order.payment.transaction = transaction._id;
    await order.save();

    return { transaction, clientPayload: providerResponse.clientPayload };
  },

  async verifyPayment({ provider, payload, userId }) {
    const adapter = paymentProviderFactory.get(provider);
    const verified = await adapter.verifyPayment({ payload });

    const transaction = await PaymentTransaction.findOneAndUpdate(
      {
        provider,
        $or: [
          { providerOrderId: verified.providerOrderId },
          { providerPaymentId: verified.providerPaymentId }
        ]
      },
      {
        providerPaymentId: verified.providerPaymentId,
        providerOrderId: verified.providerOrderId,
        status: PAYMENT_STATUS.PAID,
        rawPayload: verified.rawPayload
      },
      { new: true }
    );

    if (!transaction) throw ApiError.notFound('Payment transaction not found');

    const order = await Order.findOne({ _id: transaction.order, user: userId, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');

    order.payment.status = PAYMENT_STATUS.PAID;
    order.payment.paidAt = new Date();
    order.status = ORDER_STATUS.PAID;
    order.statusHistory.push({ status: ORDER_STATUS.PAID, note: 'Payment verified' });
    await order.save();

    return { transaction, order };
  },

  async handleWebhook({ provider, rawBody, signature }) {
    const adapter = paymentProviderFactory.get(provider);
    const event = await adapter.verifyWebhook({ rawBody, signature });
    return { accepted: true, provider, event };
  },

  async refund({ orderId, amount, reason, actorId }) {
    const order = await Order.findOne({ _id: orderId, deletedAt: null }).populate('payment.transaction');
    if (!order) throw ApiError.notFound('Order not found');
    if (!order.payment.transaction) throw ApiError.badRequest('Order has no payment transaction');

    const transaction = order.payment.transaction;
    const adapter = paymentProviderFactory.get(transaction.provider);
    const refundPayload = await adapter.refundPayment({
      paymentId: transaction.providerPaymentId,
      amount: amount || order.pricing.total,
      reason
    });

    const refundTransaction = await PaymentTransaction.create({
      order: order._id,
      user: order.user,
      provider: transaction.provider,
      type: 'refund',
      status: PAYMENT_STATUS.REFUNDED,
      amount: amount || order.pricing.total,
      currency: transaction.currency,
      rawPayload: refundPayload,
      metadata: { reason, actorId }
    });

    order.payment.status = PAYMENT_STATUS.REFUNDED;
    order.payment.refundedAt = new Date();
    order.status = ORDER_STATUS.REFUNDED;
    order.statusHistory.push({ status: ORDER_STATUS.REFUNDED, note: reason, changedBy: actorId });
    await order.save();

    return { refundTransaction, order };
  }
};
