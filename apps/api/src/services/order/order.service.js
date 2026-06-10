import { Address } from '../../models/Address.js';
import { Cart } from '../../models/Cart.js';
import { Order } from '../../models/Order.js';
import { Product } from '../../models/Product.js';
import { ORDER_STATUS, PAYMENT_PROVIDERS, PAYMENT_STATUS } from '../../constants/enums.js';
import { logger } from '../../config/logger.js';
import { orderRepository } from '../../repositories/order.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { buildInvoicePayload } from '../../utils/invoice.js';
import { cartService } from '../cart/cart.service.js';
import { couponService } from '../coupon/coupon.service.js';
import { emailService } from '../email/email.service.js';
import { inventoryService } from '../inventory/inventory.service.js';

const createOrderNumber = () => `DS${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;

const serializeAddress = address => ({
  fullName: address.fullName,
  phone: address.phone,
  line1: address.line1,
  line2: address.line2,
  city: address.city,
  state: address.state,
  postalCode: address.postalCode,
  country: address.country
});

const buildItemsFromCart = cart =>
  cart.items.map(item => ({
    product: item.product._id || item.product,
    variantSku: item.variantSku,
    sku: item.productSnapshot.sku,
    name: item.productSnapshot.name,
    slug: item.productSnapshot.slug,
    image: item.productSnapshot.image,
    quantity: item.quantity,
    unitPrice: item.priceSnapshot,
    total: item.priceSnapshot * item.quantity
  }));

const defaultStatusNotes = {
  [ORDER_STATUS.PENDING]: 'Order is pending confirmation.',
  [ORDER_STATUS.PAID]: 'Payment received.',
  [ORDER_STATUS.PROCESSING]: 'Order is being prepared.',
  [ORDER_STATUS.SHIPPED]: 'Order has been shipped.',
  [ORDER_STATUS.DELIVERED]: 'Order has been delivered.',
  [ORDER_STATUS.CANCELLED]: 'Order has been cancelled.',
  [ORDER_STATUS.REFUNDED]: 'Order has been refunded.'
};

const ensureOrderStateContainers = order => {
  if (!order.payment) {
    order.payment = {
      provider: PAYMENT_PROVIDERS.COD,
      status: PAYMENT_STATUS.PENDING
    };
  }

  if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
};

const restoreOrderStock = async ({ order, reason, actorId }) => {
  for (const item of order.items) {
    await inventoryService.adjustStock({
      productId: item.product,
      variantSku: item.variantSku,
      change: item.quantity,
      type: 'order_cancelled',
      reason,
      orderId: order._id,
      changedBy: actorId
    });
  }
};

const sendStatusNotification = async ({ order, previousStatus, note }) => {
  if (!order.customer?.email) return;

  try {
    await emailService.sendOrderStatusUpdate(order, { previousStatus, note });
  } catch (error) {
    logger.warn(
      { err: error, orderId: order._id, orderNumber: order.orderNumber },
      'Order status notification could not be sent'
    );
  }
};

export const orderService = {
  listMyOrders(userId, query) {
    return orderRepository.listForUser(userId, query);
  },

  listOrders(query) {
    return orderRepository.listForAdmin(query);
  },

  async getOrderForUser(userId, id) {
    const order = await Order.findOne({ _id: id, user: userId, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  },

  async getOrderForAdmin(id) {
    const order = await Order.findOne({ _id: id, deletedAt: null }).populate('user', 'name email phone');
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  },

  async createOrder(user, payload) {
    const cart = await cartService.getCart({ userId: user._id });
    if (!cart.items.length) throw ApiError.badRequest('Cart is empty');

    const address = payload.addressId
      ? await Address.findOne({ _id: payload.addressId, user: user._id, deletedAt: null })
      : payload.shippingAddress;
    if (!address) throw ApiError.badRequest('A valid shipping address is required');

    for (const item of cart.items) {
      await inventoryService.assertAvailable(item.product._id || item.product, item.variantSku, item.quantity);
    }

    const order = await Order.create({
      orderNumber: createOrderNumber(),
      user: user._id,
      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || address.phone
      },
      items: buildItemsFromCart(cart),
      shippingAddress: serializeAddress(address),
      billingAddress: serializeAddress(payload.billingAddress || address),
      pricing: cart.pricing,
      coupon: cart.coupon,
      payment: {
        provider: payload.paymentProvider || PAYMENT_PROVIDERS.COD,
        status: PAYMENT_STATUS.PENDING
      },
      status: ORDER_STATUS.PENDING,
      statusHistory: [{ status: ORDER_STATUS.PENDING, note: 'Order created' }],
      idempotencyKey: payload.idempotencyKey
    });

    for (const item of order.items) {
      await inventoryService.adjustStock({
        productId: item.product,
        variantSku: item.variantSku,
        change: -item.quantity,
        type: 'order_created',
        reason: `Order ${order.orderNumber}`,
        orderId: order._id,
        changedBy: user._id
      });
    }

    if (cart.coupon?.couponId) await couponService.markCouponUsed(cart.coupon.couponId, user._id);

    cart.items = [];
    cart.coupon = undefined;
    await cartService.recalculate(cart);
    await emailService.sendOrderConfirmation(order);
    return order;
  },

  async cancelOrder(userId, id, reason, actorId = userId) {
    const order = await Order.findOne({ _id: id, user: userId, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');
    if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(order.status)) {
      throw ApiError.badRequest('Order cannot be cancelled in its current status');
    }

    const previousStatus = order.status;
    await restoreOrderStock({ order, reason, actorId });

    order.status = ORDER_STATUS.CANCELLED;
    order.cancellation = { reason, cancelledAt: new Date(), cancelledBy: actorId };
    order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: reason, changedBy: actorId });
    await order.save();
    await sendStatusNotification({ order, previousStatus, note: reason });
    return order;
  },

  async requestReturn(userId, id, reason) {
    const order = await Order.findOne({ _id: id, user: userId, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');
    if (order.status !== ORDER_STATUS.DELIVERED) throw ApiError.badRequest('Only delivered orders can be returned');
    order.returnRequest = { reason, status: 'requested', requestedAt: new Date() };
    await order.save();
    return order;
  },

  async updateStatus(id, { status, note, actorId }) {
    const order = await Order.findOne({ _id: id, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');
    if (order.status === status) return order;

    const previousStatus = order.status;
    if (
      previousStatus === ORDER_STATUS.REFUNDED ||
      (previousStatus === ORDER_STATUS.CANCELLED && status !== ORDER_STATUS.REFUNDED)
    ) {
      throw ApiError.badRequest('Cancelled or refunded orders cannot be moved back into fulfillment');
    }

    ensureOrderStateContainers(order);
    const statusNote = note?.trim() || defaultStatusNotes[status] || `Order marked as ${status}.`;

    if (status === ORDER_STATUS.CANCELLED) {
      await restoreOrderStock({ order, reason: statusNote, actorId });
      order.cancellation = { reason: statusNote, cancelledAt: new Date(), cancelledBy: actorId };
    }

    order.status = status;
    if (status === ORDER_STATUS.PAID) {
      order.payment.status = PAYMENT_STATUS.PAID;
      order.payment.paidAt = order.payment.paidAt || new Date();
    }

    if (status === ORDER_STATUS.REFUNDED) {
      order.payment.status = PAYMENT_STATUS.REFUNDED;
      order.payment.refundedAt = order.payment.refundedAt || new Date();
    }

    order.statusHistory.push({ status, note: statusNote, changedBy: actorId });
    await order.save();
    await sendStatusNotification({ order, previousStatus, note: statusNote });
    return order;
  },

  async generateInvoice(id) {
    const order = await Order.findOne({ _id: id, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');
    const invoice = buildInvoicePayload(order);
    order.invoice = {
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt
    };
    await order.save();
    return invoice;
  },

  async reorder(userId, id) {
    const order = await Order.findOne({ _id: id, user: userId, deletedAt: null });
    if (!order) throw ApiError.notFound('Order not found');

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [], expiresAt: null });

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      await cartService.addItem({ userId }, { productId: product._id.toString(), variantSku: item.variantSku, quantity: item.quantity });
    }

    return cartService.getCart({ userId });
  }
};
