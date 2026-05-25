import { Coupon } from '../models/Coupon.js';
import { BaseRepository } from './BaseRepository.js';

class CouponRepository extends BaseRepository {
  constructor() {
    super(Coupon);
  }

  findActiveByCode(code) {
    return Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      deletedAt: null
    });
  }
}

export const couponRepository = new CouponRepository();
