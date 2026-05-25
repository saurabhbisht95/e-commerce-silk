import { Coupon } from '../../models/Coupon.js';
import { couponRepository } from '../../repositories/coupon.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { COUPON_TYPES } from '../../constants/enums.js';

export const couponService = {
  calculateDiscount(coupon, subtotal) {
    const rawDiscount =
      coupon.type === COUPON_TYPES.PERCENTAGE ? (subtotal * coupon.value) / 100 : coupon.value;
    return Math.min(rawDiscount, coupon.maxDiscountAmount || rawDiscount, subtotal);
  },

  async validateCoupon({ code, userId, subtotal }) {
    const coupon = await couponRepository.findActiveByCode(code);
    if (!coupon) throw ApiError.badRequest('Coupon is invalid');

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) throw ApiError.badRequest('Coupon is not active yet');
    if (coupon.expiresAt <= now) throw ApiError.badRequest('Coupon has expired');
    if (subtotal < coupon.minOrderAmount) {
      throw ApiError.badRequest(`Coupon requires a minimum order value of ${coupon.minOrderAmount}`);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('Coupon usage limit has been reached');
    }
    if (userId) {
      const usage = coupon.usedBy.find(item => item.user?.toString() === userId.toString());
      if (usage && usage.count >= coupon.userUsageLimit) {
        throw ApiError.badRequest('You have already used this coupon');
      }
    }

    const discount = this.calculateDiscount(coupon, subtotal);
    return { coupon, discount };
  },

  async markCouponUsed(couponId, userId) {
    if (!couponId) return;
    const coupon = await Coupon.findById(couponId);
    if (!coupon) return;
    coupon.usedCount += 1;
    if (userId) {
      const usage = coupon.usedBy.find(item => item.user?.toString() === userId.toString());
      if (usage) {
        usage.count += 1;
        usage.lastUsedAt = new Date();
      } else {
        coupon.usedBy.push({ user: userId, count: 1, lastUsedAt: new Date() });
      }
    }
    await coupon.save();
  }
};
