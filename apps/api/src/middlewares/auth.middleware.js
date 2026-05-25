import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { ROLE_PRIORITY, USER_ROLES } from '../constants/enums.js';

const getTokenFromRequest = req => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.signedCookies?.accessToken || req.cookies?.accessToken;
};

export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (_error) {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  const user = await User.findOne({ _id: payload.sub, deletedAt: null }).select('-password');
  if (!user || !user.isActive) throw ApiError.unauthorized('User account is inactive');

  req.user = user;
  req.auth = payload;
  return next();
});

export const optionalAuthenticate = asyncHandler(async (req, _res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findOne({ _id: payload.sub, deletedAt: null }).select('-password');
    if (user?.isActive) {
      req.user = user;
      req.auth = payload;
    }
  } catch (_error) {
    // Guest-capable endpoints should still work when no valid session is present.
  }

  return next();
});

export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());

  const userRoles = req.user.roles?.length ? req.user.roles : [USER_ROLES.USER];
  const hasRole = allowedRoles.some(role => userRoles.includes(role));

  if (!hasRole) return next(ApiError.forbidden('You do not have permission to perform this action'));
  return next();
};

export const authorizeAtLeast = minimumRole => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());

  const userRoles = req.user.roles?.length ? req.user.roles : [USER_ROLES.USER];
  const highest = Math.max(...userRoles.map(role => ROLE_PRIORITY[role] || 0));

  if (highest < ROLE_PRIORITY[minimumRole]) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  return next();
};
