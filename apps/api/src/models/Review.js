import mongoose from 'mongoose';
import { REVIEW_STATUS } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    images: [
      {
        url: String,
        publicId: String,
        alt: String
      }
    ],
    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.APPROVED,
      index: true
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    response: {
      comment: String,
      respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      respondedAt: Date
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1, deletedAt: 1 }, { unique: true });
reviewSchema.plugin(toJSONPlugin);

export const Review = model('Review', reviewSchema);
