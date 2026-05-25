import { Session } from '../../models/Session.js';
import { User } from '../../models/User.js';
import { userRepository } from '../../repositories/user.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { createRandomToken, hashToken } from '../../utils/crypto.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import { emailService } from '../email/email.service.js';
import { config } from '../../config/env.js';

const addDuration = duration => {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return new Date(Date.now() + value * multipliers[unit]);
};

const createVerificationToken = user => {
  const token = createRandomToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

const createPasswordResetToken = user => {
  const token = createRandomToken();
  user.passwordResetToken = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
  return token;
};

const buildSessionPayload = req => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
  expiresAt: addDuration(config.JWT_REFRESH_EXPIRES_IN)
});

export const authService = {
  async issueTokens(user, req) {
    const session = await Session.create({
      user: user._id,
      refreshTokenHash: 'pending',
      ...buildSessionPayload(req)
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken({ user, sessionId: session._id });
    session.refreshTokenHash = hashToken(refreshToken);
    await session.save();

    return { accessToken, refreshToken, user, session };
  },

  async register(payload, req) {
    const existing = await userRepository.findActiveByEmail(payload.email);
    if (existing) throw ApiError.conflict('An account already exists with this email');

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: await hashPassword(payload.password)
    });

    const verificationToken = createVerificationToken(user);
    await user.save();
    await emailService.sendVerificationEmail(user, verificationToken);

    return this.issueTokens(user, req);
  },

  async login({ email, password }, req) {
    const user = await userRepository.findActiveByEmail(email, true);
    if (!user || !(await comparePassword(password, user.password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    if (!user.isActive) throw ApiError.forbidden('User account is inactive');

    user.lastLoginAt = new Date();
    await user.save();
    return this.issueTokens(user, req);
  },

  async refresh(refreshToken, req) {
    if (!refreshToken) throw ApiError.unauthorized('Refresh token is required');

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (_error) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const session = await Session.findOne({
      _id: payload.sid,
      user: payload.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).select('+refreshTokenHash');

    if (!session || session.refreshTokenHash !== hashToken(refreshToken)) {
      throw ApiError.unauthorized('Refresh session is invalid');
    }

    const user = await User.findOne({ _id: payload.sub, deletedAt: null });
    if (!user || !user.isActive) throw ApiError.unauthorized('User account is inactive');

    const accessToken = signAccessToken(user);
    const nextRefreshToken = signRefreshToken({ user, sessionId: session._id });
    session.refreshTokenHash = hashToken(nextRefreshToken);
    session.userAgent = req.headers['user-agent'];
    session.ip = req.ip;
    session.expiresAt = addDuration(config.JWT_REFRESH_EXPIRES_IN);
    await session.save();

    return { accessToken, refreshToken: nextRefreshToken, user, session };
  },

  async logout(refreshToken) {
    if (!refreshToken) return;
    const hashed = hashToken(refreshToken);
    await Session.findOneAndUpdate({ refreshTokenHash: hashed, revokedAt: null }, { revokedAt: new Date() });
  },

  async logoutAll(userId) {
    await Session.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
  },

  async forgotPassword(email) {
    const user = await userRepository.findActiveByEmail(email, true);
    if (!user) return;
    const token = createPasswordResetToken(user);
    await user.save();
    await emailService.sendPasswordResetEmail(user, token);
  },

  async resetPassword({ token, password }) {
    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
      deletedAt: null
    }).select('+passwordResetToken');

    if (!user) throw ApiError.badRequest('Password reset token is invalid or expired');

    user.password = await hashPassword(password);
    user.passwordChangedAt = new Date();
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await this.logoutAll(user._id);
  },

  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
      deletedAt: null
    }).select('+emailVerificationToken');

    if (!user) throw ApiError.badRequest('Email verification token is invalid or expired');

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return user;
  },

  async resendVerification(userId) {
    const user = await User.findById(userId).select('+emailVerificationToken');
    if (!user) throw ApiError.notFound('User not found');
    if (user.isEmailVerified) return user;
    const token = createVerificationToken(user);
    await user.save();
    await emailService.sendVerificationEmail(user, token);
    return user;
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user || !(await comparePassword(currentPassword, user.password))) {
      throw ApiError.badRequest('Current password is incorrect');
    }
    user.password = await hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();
    await this.logoutAll(user._id);
    return user;
  }
};
