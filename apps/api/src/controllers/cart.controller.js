import { cartService } from '../services/cart/cart.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getOwner = req => ({
  userId: req.user?._id,
  guestId: req.headers['x-guest-id'] || req.query.guestId || req.body.guestId
});

export const cartController = {
  get: asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(getOwner(req));
    sendSuccess(res, 200, 'Cart fetched successfully', { cart });
  }),

  addItem: asyncHandler(async (req, res) => {
    const cart = await cartService.addItem(getOwner(req), req.body);
    sendSuccess(res, 200, 'Item added to cart successfully', { cart });
  }),

  updateItem: asyncHandler(async (req, res) => {
    const cart = await cartService.updateItem(getOwner(req), req.body);
    sendSuccess(res, 200, 'Cart item updated successfully', { cart });
  }),

  removeItem: asyncHandler(async (req, res) => {
    const cart = await cartService.removeItem(getOwner(req), req.body);
    sendSuccess(res, 200, 'Cart item removed successfully', { cart });
  }),

  clear: asyncHandler(async (req, res) => {
    const cart = await cartService.clearCart(getOwner(req));
    sendSuccess(res, 200, 'Cart cleared successfully', { cart });
  }),

  applyCoupon: asyncHandler(async (req, res) => {
    const cart = await cartService.applyCoupon(getOwner(req), req.body.code);
    sendSuccess(res, 200, 'Coupon applied successfully', { cart });
  }),

  removeCoupon: asyncHandler(async (req, res) => {
    const cart = await cartService.removeCoupon(getOwner(req));
    sendSuccess(res, 200, 'Coupon removed successfully', { cart });
  }),

  mergeGuest: asyncHandler(async (req, res) => {
    const cart = await cartService.mergeGuestCart(req.user._id, req.body.guestId);
    sendSuccess(res, 200, 'Guest cart merged successfully', { cart });
  })
};
