import { config } from '../config/env.js';

const baseCookieOptions = {
  httpOnly: true,
  secure: config.COOKIE_SECURE || config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  signed: true,
  path: '/'
};

if (config.COOKIE_DOMAIN) {
  baseCookieOptions.domain = config.COOKIE_DOMAIN;
}

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    ...baseCookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookies = res => {
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', baseCookieOptions);
};
