import { Wishlist } from '../../models/Wishlist.js';

export const wishlistService = {
  async getWishlist(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products',
      match: { deletedAt: null, status: 'active' },
      populate: { path: 'category', select: 'name slug' }
    });
    if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
    return wishlist;
  },

  async addProduct(userId, productId) {
    return Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    ).populate('products');
  },

  async removeProduct(userId, productId) {
    return Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true, upsert: true }
    ).populate('products');
  }
};
