import { InventoryLedger } from '../../models/InventoryLedger.js';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';

const getVariant = (product, variantSku) => {
  if (!variantSku) return null;
  return product.variants.find(variant => variant.sku === variantSku);
};

export const inventoryService = {
  getAvailableStock(product, variantSku) {
    const variant = getVariant(product, variantSku);
    if (variant) return Math.max(variant.stock - variant.reservedStock, 0);
    return Math.max(product.stock - product.reservedStock, 0);
  },

  async assertAvailable(productId, variantSku, quantity) {
    const product = await Product.findOne({ _id: productId, deletedAt: null });
    if (!product) throw ApiError.notFound('Product not found');
    if (product.inventoryPolicy === 'continue') return product;
    if (this.getAvailableStock(product, variantSku) < quantity) {
      throw ApiError.badRequest('Insufficient stock available');
    }
    return product;
  },

  async adjustStock({ productId, variantSku, change, type, reason, orderId, changedBy }) {
    const product = await Product.findOne({ _id: productId, deletedAt: null });
    if (!product) throw ApiError.notFound('Product not found');

    const variant = getVariant(product, variantSku);
    const previousStock = variant ? variant.stock : product.stock;
    const newStock = previousStock + change;
    if (newStock < 0 && product.inventoryPolicy === 'deny') {
      throw ApiError.badRequest('Stock cannot go below zero');
    }

    if (variant) variant.stock = Math.max(newStock, 0);
    else product.stock = Math.max(newStock, 0);

    await product.save();
    await InventoryLedger.create({
      product: product._id,
      variantSku,
      change,
      previousStock,
      newStock: variant ? variant.stock : product.stock,
      type,
      reason,
      order: orderId,
      changedBy
    });

    return product;
  },

  async listLowStock(limit = 50) {
    return Product.find({
      deletedAt: null,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    })
      .sort({ stock: 1 })
      .limit(limit)
      .select('name slug sku stock lowStockThreshold variants')
      .lean({ virtuals: true });
  }
};
