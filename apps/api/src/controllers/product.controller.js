import { productService } from '../services/product/product.service.js';
import { inventoryService } from '../services/inventory/inventory.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const productController = {
  list: asyncHandler(async (req, res) => {
    const includeInactive = req.user?.roles?.some(role => ['admin', 'super_admin'].includes(role));
    const result = await productService.listProducts(req.query, { includeInactive });
    sendSuccess(res, 200, 'Products fetched successfully', { products: result.products }, result.meta);
  }),

  featured: asyncHandler(async (req, res) => {
    const products = await productService.getFeatured(Number(req.query.limit || 10));
    sendSuccess(res, 200, 'Featured products fetched successfully', { products });
  }),

  trending: asyncHandler(async (req, res) => {
    const products = await productService.getTrending(Number(req.query.limit || 10));
    sendSuccess(res, 200, 'Trending products fetched successfully', { products });
  }),

  getBySlugOrId: asyncHandler(async (req, res) => {
    const includeInactive = req.user?.roles?.some(role => ['admin', 'super_admin'].includes(role));
    const product = await productService.getProduct(req.params.slugOrId, includeInactive);
    sendSuccess(res, 200, 'Product fetched successfully', { product });
  }),

  related: asyncHandler(async (req, res) => {
    const products = await productService.getRelatedProducts(req.params.id, Number(req.query.limit || 8));
    sendSuccess(res, 200, 'Related products fetched successfully', { products });
  }),

  create: asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);
    sendCreated(res, 'Product created successfully', { product });
  }),

  update: asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    sendSuccess(res, 200, 'Product updated successfully', { product });
  }),

  remove: asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    sendSuccess(res, 200, 'Product deleted successfully');
  }),

  adjustStock: asyncHandler(async (req, res) => {
    const product = await inventoryService.adjustStock({
      productId: req.params.id,
      variantSku: req.body.variantSku,
      change: req.body.change,
      type: 'manual_adjustment',
      reason: req.body.reason,
      changedBy: req.user._id
    });
    sendSuccess(res, 200, 'Inventory adjusted successfully', { product });
  })
};
