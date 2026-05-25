import mongoose from 'mongoose';
import { USER_ROLES } from '../constants/enums.js';
import { toJSONPlugin } from './plugins/toJSON.plugin.js';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    roles: {
      type: [String],
      enum: Object.values(USER_ROLES),
      default: [USER_ROLES.USER],
      index: true
    },
    avatar: {
      url: String,
      publicId: String
    },
    google: {
      id: { type: String, index: true, sparse: true },
      email: String
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: Date,
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    lastLoginAt: Date,
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

userSchema.index({ email: 1, deletedAt: 1 });
userSchema.plugin(toJSONPlugin);

export const User = model('User', userSchema);
