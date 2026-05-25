import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const bannerImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    alt: String
  },
  { _id: false }
);

const bannerSchema = new Schema(
  {
    headline: {
      type: [String],
      required: true,
      validate: {
        validator: value => Array.isArray(value) && value.length > 0 && value.length <= 3,
        message: 'Banner headline must contain one to three lines'
      }
    },
    subtext: {
      type: String,
      trim: true,
      default: ''
    },
    cta: {
      type: String,
      trim: true,
      default: 'Explore Collection'
    },
    ctaHref: {
      type: String,
      trim: true,
      default: '/collections'
    },
    modelImage: {
      type: bannerImageSchema,
      required: true
    },
    sideImage: bannerImageSchema,
    sortOrder: {
      type: Number,
      default: 0,
      index: true
    },
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

bannerSchema.index({ isActive: 1, deletedAt: 1, sortOrder: 1 });
bannerSchema.plugin(toJSONPlugin);

export const Banner = model('Banner', bannerSchema);
