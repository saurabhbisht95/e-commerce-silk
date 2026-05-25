import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const signAccessToken = user =>
  jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.roles,
      email: user.email
    },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
  );

export const signRefreshToken = ({ user, sessionId }) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      sid: sessionId.toString(),
      tokenType: 'refresh'
    },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );

export const verifyAccessToken = token => jwt.verify(token, config.JWT_ACCESS_SECRET);

export const verifyRefreshToken = token => jwt.verify(token, config.JWT_REFRESH_SECRET);
