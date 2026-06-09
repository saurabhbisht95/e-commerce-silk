import mongoose from 'mongoose';
import { Category } from '../../models/Category.js';
import { Product } from '../../models/Product.js';
import { productRepository } from '../../repositories/product.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { createSlug } from '../../utils/slug.js';
import { PRODUCT_STATUS } from '../../constants/enums.js';
import { toProductDTO, toProductListDTO } from './product.presenter.js';

const ensureSlug = payload => payload.slug || createSlug(payload.name);
const EMPTY_CATEGORY_ID = '000000000000000000000000';

const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ensureCategory = async categoryId => {
  const category = await Category.findOne({ _id: categoryId, deletedAt: null });
  if (!category) throw ApiError.badRequest('Category does not exist');
  return category;
};

const resolveCategoryQuery = async query => {
  const categoryValue = query.categorySlug || query.categoryName || query.category;
  if (!categoryValue) return query;

  const nextQuery = { ...query };
  delete nextQuery.categorySlug;
  delete nextQuery.categoryName;

  if (mongoose.isValidObjectId(categoryValue)) {
    nextQuery.category = categoryValue;
    return nextQuery;
  }

  const normalizedSlug = createSlug(categoryValue);
  const slugCandidates = [...new Set([
    normalizedSlug,
    normalizedSlug.endsWith('s') ? normalizedSlug.slice(0, -1) : `${normalizedSlug}s`
  ])];
  const nameCandidates = [...new Set([
    String(categoryValue),
    String(categoryValue).endsWith('s') ? String(categoryValue).slice(0, -1) : `${categoryValue}s`
  ])];
  const category = await Category.findOne({
    deletedAt: null,
    isActive: true,
    $or: [
      ...slugCandidates.map(slug => ({ slug })),
      ...nameCandidates.map(name => ({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') }))
    ]
  }).select('_id');

  nextQuery.category = category?._id?.toString() || EMPTY_CATEGORY_ID;
  return nextQuery;
};

export const productService = {
  async listProducts(query, options = {}) {
    const resolvedQuery = await resolveCategoryQuery(query);
    const result = await productRepository.listProducts(resolvedQuery, options);
    return {
      products: toProductListDTO(result.items),
      meta: result.meta
    };
  },

  async getProduct(slugOrId, includeInactive = false) {
    const product = await productRepository.findBySlugOrId(slugOrId, includeInactive);
    if (!product) throw ApiError.notFound('Product not found');
    return toProductDTO(product);
  },

  async createProduct(payload) {
    await ensureCategory(payload.category);
    const product = await Product.create({
      ...payload,
      slug: ensureSlug(payload),
      status: payload.status || PRODUCT_STATUS.DRAFT,
      publishedAt: payload.status === PRODUCT_STATUS.ACTIVE ? new Date() : undefined
    });
    return toProductDTO(await product.populate('category', 'name slug parent'));
  },

  async updateProduct(id, payload) {
    if (payload.category) await ensureCategory(payload.category);
    const update = { ...payload };
    if (payload.name && !payload.slug) update.slug = createSlug(payload.name);
    if (payload.status === PRODUCT_STATUS.ACTIVE) update.publishedAt = new Date();

    const product = await Product.findOneAndUpdate(
      { _id: id, deletedAt: null },
      update,
      { new: true, runValidators: true }
    ).populate('category', 'name slug parent');

    if (!product) throw ApiError.notFound('Product not found');
    return toProductDTO(product);
  },

  async deleteProduct(id) {
    const product = await Product.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date(), status: PRODUCT_STATUS.ARCHIVED },
      { new: true }
    );
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  async getRelatedProducts(id, limit = 8) {
    const product = await Product.findOne({ _id: id, deletedAt: null }).populate('category', 'name slug parent');
    if (!product) throw ApiError.notFound('Product not found');
    const related = await productRepository.listRelated(product, limit);
    return toProductListDTO(related);
  },

  async getFeatured(limit = 10) {
    const { products } = await this.listProducts({ featured: true, limit, sort: 'newest' });
    return products;
  },

  async getTrending(limit = 10) {
    const { products } = await this.listProducts({ trending: true, limit, sort: 'popularity' });
    return products;
  }
};
