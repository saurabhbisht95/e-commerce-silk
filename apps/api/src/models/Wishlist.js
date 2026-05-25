import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  { timestamps: true }
);

wishlistSchema.plugin(toJSONPlugin);

export const Wishlist = model('Wishlist', wishlistSchema);
