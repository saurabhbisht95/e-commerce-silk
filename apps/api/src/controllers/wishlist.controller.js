import { wishlistService } from '../services/wishlist/wishlist.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const wishlistController = {
  get: asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(req.user._id);
    sendSuccess(res, 200, 'Wishlist fetched successfully', { wishlist });
  }),

  add: asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.addProduct(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Product added to wishlist successfully', { wishlist });
  }),

  remove: asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.removeProduct(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Product removed from wishlist successfully', { wishlist });
  })
};
