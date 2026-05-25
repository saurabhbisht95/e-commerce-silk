import { Coupon } from '../models/Coupon.js';
import { couponService } from '../services/coupon/coupon.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, buildPaginationMeta } from '../utils/pagination.js';

export const couponController = {
  list: asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { deletedAt: null };
    if (req.query.search) filter.code = new RegExp(req.query.search, 'i');
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive;
    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort('-createdAt').skip(skip).limit(limit),
      Coupon.countDocuments(filter)
    ]);
    sendSuccess(res, 200, 'Coupons fetched successfully', { coupons }, buildPaginationMeta({ page, limit, total }));
  }),

  create: asyncHandler(async (req, res) => {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
    sendCreated(res, 'Coupon created successfully', { coupon });
  }),

  update: asyncHandler(async (req, res) => {
    const update = { ...req.body };
    if (update.code) update.code = update.code.toUpperCase();
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      update,
      { new: true, runValidators: true }
    );
    sendSuccess(res, 200, 'Coupon updated successfully', { coupon });
  }),

  remove: asyncHandler(async (req, res) => {
    await Coupon.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, { deletedAt: new Date(), isActive: false });
    sendSuccess(res, 200, 'Coupon deleted successfully');
  }),

  validate: asyncHandler(async (req, res) => {
    const result = await couponService.validateCoupon({
      code: req.body.code,
      subtotal: req.body.subtotal,
      userId: req.user?._id
    });
    sendSuccess(res, 200, 'Coupon validated successfully', {
      coupon: result.coupon,
      discount: result.discount
    });
  })
};
