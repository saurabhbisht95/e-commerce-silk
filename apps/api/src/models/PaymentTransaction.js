import mongoose from 'mongoose';
import { PAYMENT_PROVIDERS, PAYMENT_STATUS } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const paymentTransactionSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    provider: {
      type: String,
      enum: Object.values(PAYMENT_PROVIDERS),
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['payment', 'refund'],
      default: 'payment',
      index: true
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    providerPaymentId: {
      type: String,
      index: true,
      sparse: true
    },
    providerOrderId: {
      type: String,
      index: true,
      sparse: true
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true
    },
    rawPayload: Schema.Types.Mixed,
    error: {
      code: String,
      message: String,
      raw: Schema.Types.Mixed
    },
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

paymentTransactionSchema.plugin(toJSONPlugin);

export const PaymentTransaction = model('PaymentTransaction', paymentTransactionSchema);
