import { Product } from '../../models/Product.js';
import { Review } from '../../models/Review.js';
import { reviewRepository } from '../../repositories/review.repository.js';
import { ApiError } from '../../utils/ApiError.js';

const recalculateProductRating = async productId => {
  const [stats] = await Review.aggregate([
    { $match: { product: productId, deletedAt: null, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingAverage: stats ? Math.round(stats.average * 10) / 10 : 0,
    ratingCount: stats?.count || 0
  });
};

export const reviewService = {
  listForProduct(productId, query) {
    return reviewRepository.listForProduct(productId, query);
  },

  async createReview(userId, productId, payload) {
    const product = await Product.findOne({ _id: productId, deletedAt: null });
    if (!product) throw ApiError.notFound('Product not found');

    const review = await Review.create({
      ...payload,
      product: productId,
      user: userId
    });
    await recalculateProductRating(product._id);
    return review.populate('user', 'name avatar');
  },

  async updateReview(userId, id, payload) {
    const review = await Review.findOneAndUpdate(
      { _id: id, user: userId, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );
    if (!review) throw ApiError.notFound('Review not found');
    await recalculateProductRating(review.product);
    return review.populate('user', 'name avatar');
  },

  async deleteReview(userId, id) {
    const review = await Review.findOneAndUpdate(
      { _id: id, user: userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!review) throw ApiError.notFound('Review not found');
    await recalculateProductRating(review.product);
    return review;
  },

  async moderateReview(id, payload) {
    const review = await Review.findOneAndUpdate(
      { _id: id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );
    if (!review) throw ApiError.notFound('Review not found');
    await recalculateProductRating(review.product);
    return review;
  }
};
