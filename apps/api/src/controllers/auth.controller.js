import { authService } from '../services/auth/auth.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookies, setAuthCookies } from '../utils/cookies.js';

const getRefreshToken = req => req.signedCookies?.refreshToken || req.cookies?.refreshToken || req.body.refreshToken;

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body, req);
    setAuthCookies(res, result);
    sendCreated(res, 'Account created successfully', { user: result.user, accessToken: result.accessToken });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body, req);
    setAuthCookies(res, result);
    sendSuccess(res, 200, 'Logged in successfully', { user: result.user, accessToken: result.accessToken });
  }),

  refresh: asyncHandler(async (req, res) => {
    const result = await authService.refresh(getRefreshToken(req), req);
    setAuthCookies(res, result);
    sendSuccess(res, 200, 'Token refreshed successfully', { user: result.user, accessToken: result.accessToken });
  }),

  logout: asyncHandler(async (req, res) => {
    await authService.logout(getRefreshToken(req));
    clearAuthCookies(res);
    sendSuccess(res, 200, 'Logged out successfully');
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, 200, 'If an account exists, a password reset email has been sent');
  }),

  resetPassword: asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body);
    clearAuthCookies(res);
    sendSuccess(res, 200, 'Password reset successfully');
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    const user = await authService.verifyEmail(req.body.token);
    sendSuccess(res, 200, 'Email verified successfully', { user });
  }),

  resendVerification: asyncHandler(async (req, res) => {
    await authService.resendVerification(req.user._id);
    sendSuccess(res, 200, 'Verification email sent successfully');
  }),

  changePassword: asyncHandler(async (req, res) => {
    await authService.changePassword(req.user._id, req.body);
    clearAuthCookies(res);
    sendSuccess(res, 200, 'Password changed successfully. Please sign in again.');
  }),

  me: asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Profile fetched successfully', { user: req.user });
  }),

  googleOAuthReady: asyncHandler(async (_req, res) => {
    sendSuccess(res, 200, 'Google OAuth endpoint is ready for provider callback wiring', {
      provider: 'google',
      status: 'ready'
    });
  })
};
