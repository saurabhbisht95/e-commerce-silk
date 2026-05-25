import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/enums.js';
import { Product } from '../models/Product.js';
import { BaseRepository } from './BaseRepository.js';

const sortMap = {
  newest: '-createdAt',
  oldest: 'createdAt',
  price_asc: 'price',
  price_desc: '-price',
  rating: '-ratingAverage',
  popularity: '-salesCount'
};

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  buildFilter(query, { includeInactive = false } = {}) {
    const filter = { deletedAt: null };

    if (!includeInactive) filter.status = PRODUCT_STATUS.ACTIVE;
    if (query.status && includeInactive) filter.status = query.status;
    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = new RegExp(`^${query.brand}$`, 'i');
    if (query.featured !== undefined) filter['flags.featured'] = query.featured;
    if (query.trending !== undefined) filter['flags.trending'] = query.trending;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
    }
    if (query.size) filter['variants.size'] = query.size;
    if (query.color) filter['variants.color.name'] = new RegExp(query.color, 'i');
    if (query.tags?.length) filter.tags = { $all: query.tags };
    if (query.search) filter.$text = { $search: query.search };

    return filter;
  }

  listProducts(query, options = {}) {
    const filter = this.buildFilter(query, options);
    const sort = query.search ? { score: { $meta: 'textScore' } } : sortMap[query.sort] || '-createdAt';
    return this.paginate({
      filter,
      query,
      projection: query.search ? { score: { $meta: 'textScore' } } : undefined,
      populate: [{ path: 'category', select: 'name slug parent' }],
      sort
    });
  }

  findBySlugOrId(slugOrId, includeInactive = false) {
    const filter = mongoose.isValidObjectId(slugOrId) ? { _id: slugOrId } : { slug: slugOrId };
    filter.deletedAt = null;
    if (!includeInactive) filter.status = PRODUCT_STATUS.ACTIVE;
    return Product.findOne(filter).populate('category', 'name slug parent');
  }

  listRelated(product, limit = 8) {
    return Product.find({
      _id: { $ne: product._id },
      category: product.category?._id || product.category,
      status: PRODUCT_STATUS.ACTIVE,
      deletedAt: null
    })
      .sort({ ratingAverage: -1, salesCount: -1 })
      .limit(limit)
      .populate('category', 'name slug parent')
      .lean({ virtuals: true });
  }
}

export const productRepository = new ProductRepository();
