export const USER_ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
});

export const ROLE_PRIORITY = Object.freeze({
  [USER_ROLES.USER]: 1,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.SUPER_ADMIN]: 3
});

export const PRODUCT_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived'
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
});

export const PAYMENT_PROVIDERS = Object.freeze({
  COD: 'cod',
  STRIPE: 'stripe',
  RAZORPAY: 'razorpay',
  PAYPAL: 'paypal'
});

export const COUPON_TYPES = Object.freeze({
  PERCENTAGE: 'percentage',
  FLAT: 'flat'
});

export const REVIEW_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
});
