import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    label: {
      type: String,
      trim: true,
      default: 'Home'
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    line1: {
      type: String,
      required: true,
      trim: true
    },
    line2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'India'
    },
    isDefault: {
      type: Boolean,
      default: false,
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

addressSchema.index({ user: 1, deletedAt: 1 });
addressSchema.plugin(toJSONPlugin);

export const Address = model('Address', addressSchema);
