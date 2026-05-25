import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String,
    position: { type: Number, default: 0 }
  },
  { _id: false }
);

const variantSchema = new Schema(
  {
    sku: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    color: {
      name: String,
      hex: String
    },
    price: {
      type: Number,
      min: 0
    },
    compareAtPrice: {
      type: Number,
      min: 0
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    reservedStock: {
      type: Number,
      min: 0,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5
    },
    images: [imageSchema],
    attributes: Schema.Types.Mixed,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    legacyId: {
      type: Number,
      index: true,
      sparse: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    shortDescription: {
      type: String,
      default: ''
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        index: true
      }
    ],
    brand: {
      type: String,
      trim: true,
      default: 'Doon Silk',
      index: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    compareAtPrice: {
      type: Number,
      min: 0
    },
    costPrice: {
      type: Number,
      min: 0,
      select: false
    },
    currency: {
      type: String,
      default: 'INR'
    },
    displayPrice: String,
    images: [imageSchema],
    variants: [variantSchema],
    stock: {
      type: Number,
      min: 0,
      default: 0,
      index: true
    },
    reservedStock: {
      type: Number,
      min: 0,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5
    },
    inventoryPolicy: {
      type: String,
      enum: ['deny', 'continue'],
      default: 'deny'
    },
    attributes: Schema.Types.Mixed,
    tags: [{ type: String, trim: true, lowercase: true, index: true }],
    flags: {
      featured: { type: Boolean, default: false, index: true },
      trending: { type: Boolean, default: false, index: true }
    },
    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      index: true
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    salesCount: {
      type: Number,
      default: 0,
      index: true
    },
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
      index: true
    },
    publishedAt: Date,
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, status: 1, deletedAt: 1, price: 1 });
productSchema.index({ 'variants.sku': 1 }, { sparse: true });
productSchema.plugin(toJSONPlugin);

export const Product = model('Product', productSchema);
