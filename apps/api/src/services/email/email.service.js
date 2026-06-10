import nodemailer from 'nodemailer';
import { config } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const hasSmtpConfig = Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS);

const orderStatusMessages = {
  pending: 'Your order is pending confirmation.',
  paid: 'Payment has been received for your order.',
  processing: 'Your order is being prepared by our team.',
  shipped: 'Good news, your order has been shipped.',
  delivered: 'Your order has been delivered.',
  cancelled: 'Your order has been cancelled.',
  refunded: 'Your order refund has been processed.'
};

const formatStatus = status =>
  String(status || '')
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const escapeHtml = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createTransport = () => {
  if (!hasSmtpConfig) return null;
  return nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS
    }
  });
};

export const emailService = {
  async sendMail({ to, subject, html, text }) {
    const transporter = createTransport();

    if (!transporter) {
      logger.info({ to, subject, text }, 'SMTP not configured; email logged instead of sent');
      return { queued: false, logged: true };
    }

    const info = await transporter.sendMail({
      from: config.SMTP_FROM,
      to,
      subject,
      html,
      text
    });

    logger.info({ messageId: info.messageId, to }, 'Email sent');
    return { queued: true, messageId: info.messageId };
  },

  sendVerificationEmail(user, token) {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
    return this.sendMail({
      to: user.email,
      subject: 'Verify your Doon Silk account',
      text: `Verify your account: ${verificationUrl}`,
      html: `<p>Hello ${user.name},</p><p>Please verify your Doon Silk account.</p><p><a href="${verificationUrl}">Verify email</a></p>`
    });
  },

  sendPasswordResetEmail(user, token) {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
    return this.sendMail({
      to: user.email,
      subject: 'Reset your Doon Silk password',
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Hello ${user.name},</p><p>Use this secure link to reset your password.</p><p><a href="${resetUrl}">Reset password</a></p>`
    });
  },

  sendOrderConfirmation(order) {
    return this.sendMail({
      to: order.customer.email,
      subject: `Doon Silk order ${order.orderNumber} confirmed`,
      text: `Your order ${order.orderNumber} has been received. Total: ${order.pricing.total}`,
      html: `<p>Thank you for shopping with Doon Silk.</p><p>Order <strong>${order.orderNumber}</strong> total: <strong>${order.pricing.total}</strong>.</p>`
    });
  },

  sendOrderStatusUpdate(order, { previousStatus, note } = {}) {
    const statusLabel = formatStatus(order.status);
    const previousLabel = previousStatus ? formatStatus(previousStatus) : '';
    const message = orderStatusMessages[order.status] || `Your order status is now ${statusLabel}.`;
    const orderUrl = `${config.FRONTEND_URL}/orders`;
    const noteText = note ? ` Note: ${note}` : '';

    return this.sendMail({
      to: order.customer.email,
      subject: `Doon Silk order ${order.orderNumber}: ${statusLabel}`,
      text: [
        `Hello ${order.customer.name || 'there'},`,
        message,
        `Order: ${order.orderNumber}`,
        `Status: ${statusLabel}`,
        previousLabel ? `Previous status: ${previousLabel}` : '',
        note ? `Note: ${note}` : '',
        `Track your order: ${orderUrl}`
      ].filter(Boolean).join('\n'),
      html: `
        <p>Hello ${escapeHtml(order.customer.name || 'there')},</p>
        <p>${escapeHtml(message)}</p>
        <p>Order <strong>${escapeHtml(order.orderNumber)}</strong> is now <strong>${escapeHtml(statusLabel)}</strong>.</p>
        ${previousLabel ? `<p>Previous status: ${escapeHtml(previousLabel)}</p>` : ''}
        ${note ? `<p>${escapeHtml(noteText.trim())}</p>` : ''}
        <p><a href="${orderUrl}">Track your order</a></p>
      `
    });
  }
};
