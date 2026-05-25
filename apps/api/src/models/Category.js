import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    },
    description: String,
    image: {
      url: String,
      publicId: String,
      alt: String
    },
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },
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

categorySchema.index({ parent: 1, isActive: 1, sortOrder: 1 });
categorySchema.plugin(toJSONPlugin);

export const Category = model('Category', categorySchema);
