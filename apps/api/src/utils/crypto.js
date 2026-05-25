import crypto from 'crypto';

export const createRandomToken = () => crypto.randomBytes(32).toString('hex');

export const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

export const timingSafeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};
