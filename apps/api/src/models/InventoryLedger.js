import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const inventoryLedgerSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    variantSku: {
      type: String,
      index: true
    },
    change: {
      type: Number,
      required: true
    },
    previousStock: Number,
    newStock: Number,
    type: {
      type: String,
      enum: ['manual_adjustment', 'order_created', 'order_cancelled', 'return_received', 'stock_sync'],
      required: true,
      index: true
    },
    reason: String,
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      index: true
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

inventoryLedgerSchema.index({ product: 1, createdAt: -1 });
inventoryLedgerSchema.plugin(toJSONPlugin);

export const InventoryLedger = model('InventoryLedger', inventoryLedgerSchema);
