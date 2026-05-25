import { Category } from '../../models/Category.js';
import { Product } from '../../models/Product.js';
import { productRepository } from '../../repositories/product.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { createSlug } from '../../utils/slug.js';
import { PRODUCT_STATUS } from '../../constants/enums.js';
import { toProductDTO, toProductListDTO } from './product.presenter.js';

const ensureSlug = payload => payload.slug || createSlug(payload.name);

const ensureCategory = async categoryId => {
  const category = await Category.findOne({ _id: categoryId, deletedAt: null });
  if (!category) throw ApiError.badRequest('Category does not exist');
  return category;
};

export const productService = {
  async listProducts(query, options = {}) {
    const result = await productRepository.listProducts(query, options);
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
