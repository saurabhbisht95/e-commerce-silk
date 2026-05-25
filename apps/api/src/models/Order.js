import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_PROVIDERS, PAYMENT_STATUS } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const orderAddressSchema = new Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  { _id: false }
);

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantSku: String,
    sku: String,
    name: String,
    slug: String,
    image: String,
    quantity: {
      type: Number,
      min: 1,
      required: true
    },
    unitPrice: {
      type: Number,
      min: 0,
      required: true
    },
    total: {
      type: Number,
      min: 0,
      required: true
    }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    customer: {
      name: String,
      email: String,
      phone: String
    },
    items: [orderItemSchema],
    shippingAddress: orderAddressSchema,
    billingAddress: orderAddressSchema,
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      tax: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 }
    },
    coupon: {
      code: String,
      couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
      discount: Number
    },
    payment: {
      provider: {
        type: String,
        enum: Object.values(PAYMENT_PROVIDERS),
        default: PAYMENT_PROVIDERS.COD
      },
      status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
        index: true
      },
      transaction: {
        type: Schema.Types.ObjectId,
        ref: 'PaymentTransaction'
      },
      paidAt: Date,
      refundedAt: Date
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true
    },
    statusHistory: [
      {
        status: { type: String, enum: Object.values(ORDER_STATUS) },
        note: String,
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now }
      }
    ],
    cancellation: {
      reason: String,
      cancelledAt: Date,
      cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    returnRequest: {
      reason: String,
      status: {
        type: String,
        enum: ['requested', 'approved', 'rejected', 'received', 'refunded']
      },
      requestedAt: Date,
      resolvedAt: Date
    },
    invoice: {
      invoiceNumber: String,
      issuedAt: Date,
      url: String
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true
    },
    notes: String,
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.plugin(toJSONPlugin);

export const Order = model('Order', orderSchema);
