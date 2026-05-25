import mongoose from 'mongoose';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const auditLogSchema = new Schema(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      index: true
    },
    ip: String,
    userAgent: String,
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

auditLogSchema.plugin(toJSONPlugin);

export const AuditLog = model('AuditLog', auditLogSchema);
