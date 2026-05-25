export const createInvoiceNumber = orderNumber => `INV-${orderNumber}`;

export const buildInvoicePayload = order => ({
  invoiceNumber: createInvoiceNumber(order.orderNumber),
  issuedAt: new Date(),
  orderNumber: order.orderNumber,
  customer: order.customer,
  billingAddress: order.billingAddress || order.shippingAddress,
  shippingAddress: order.shippingAddress,
  items: order.items,
  pricing: order.pricing,
  payment: order.payment
});
