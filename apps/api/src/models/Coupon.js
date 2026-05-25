import mongoose from 'mongoose';
import { COUPON_TYPES } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: String,
    type: {
      type: String,
      enum: Object.values(COUPON_TYPES),
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      min: 0
    },
    startsAt: Date,
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    usageLimit: {
      type: Number,
      min: 1
    },
    userUsageLimit: {
      type: Number,
      min: 1,
      default: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    usedBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        count: { type: Number, default: 1 },
        lastUsedAt: Date
      }
    ],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    excludedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, isActive: 1, expiresAt: 1 });
couponSchema.plugin(toJSONPlugin);

export const Coupon = model('Coupon', couponSchema);
