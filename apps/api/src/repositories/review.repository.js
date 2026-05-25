import { Review } from '../models/Review.js';
import { BaseRepository } from './BaseRepository.js';

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  listForProduct(productId, query) {
    return this.paginate({
      filter: { product: productId, status: 'approved', deletedAt: null },
      query,
      populate: [{ path: 'user', select: 'name avatar' }],
      sort: '-createdAt'
    });
  }
}

export const reviewRepository = new ReviewRepository();
