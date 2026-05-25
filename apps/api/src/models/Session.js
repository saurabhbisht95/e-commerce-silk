import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    refreshTokenHash: {
      type: String,
      required: true,
      select: false
    },
    userAgent: String,
    ip: String,
    revokedAt: {
      type: Date,
      default: null,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    }
  },
  { timestamps: true }
);

sessionSchema.plugin(toJSONPlugin);

export const Session = model('Session', sessionSchema);
