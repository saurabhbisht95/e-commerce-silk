import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const cartItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantSku: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0
    },
    productSnapshot: {
      name: String,
      slug: String,
      image: String,
      sku: String
    }
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    guestId: {
      type: String
    },
    items: [cartItemSchema],
    coupon: {
      code: String,
      couponId: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon'
      },
      discount: {
        type: Number,
        default: 0
      }
    },
    pricing: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 },
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestId: 1 }, { unique: true, sparse: true });
cartSchema.plugin(toJSONPlugin);

export const Cart = model('Cart', cartSchema);
