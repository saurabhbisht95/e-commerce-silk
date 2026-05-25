import { Cart } from '../../models/Cart.js';
import { Product } from '../../models/Product.js';
import { cartRepository } from '../../repositories/cart.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { couponService } from '../coupon/coupon.service.js';
import { inventoryService } from '../inventory/inventory.service.js';

const getOwnerFilter = ({ userId, guestId }) => {
  if (userId) return { user: userId };
  if (guestId) return { guestId };
  throw ApiError.badRequest('A user session or guest id is required');
};

const getProductPrice = (product, variantSku) => {
  const variant = variantSku ? product.variants.find(item => item.sku === variantSku) : null;
  return variant?.price ?? product.price;
};

const buildSnapshot = (product) => ({
  name: product.name,
  slug: product.slug,
  image: product.images?.[0]?.url || '',
  sku: product.sku
});

export const cartService = {
  async getCart(owner) {
    let cart = await cartRepository.findByOwner(owner);
    if (!cart) {
      cart = await Cart.create({
        ...getOwnerFilter(owner),
        items: [],
        expiresAt: owner.userId ? null : undefined
      });
    }
    return this.recalculate(cart);
  },

  async recalculate(cart) {
    await cart.populate('items.product', 'name slug sku images price stock variants status deletedAt');
    const subtotal = cart.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
    let discount = 0;

    if (cart.coupon?.code) {
      try {
        const result = await couponService.validateCoupon({
          code: cart.coupon.code,
          userId: cart.user,
          subtotal
        });
        discount = result.discount;
        cart.coupon.discount = discount;
      } catch (_error) {
        cart.coupon = undefined;
      }
    }

    cart.pricing = {
      subtotal,
      discount,
      shipping: subtotal - discount >= 1999 || subtotal === 0 ? 0 : 99,
      tax: 0,
      total: Math.max(subtotal - discount + (subtotal - discount >= 1999 || subtotal === 0 ? 0 : 99), 0)
    };

    await cart.save();
    return cart;
  },

  async addItem(owner, { productId, variantSku, quantity }) {
    const product = await inventoryService.assertAvailable(productId, variantSku, quantity);
    const cart = await this.getCart(owner);
    const existing = cart.items.find(
      item => item.product._id.toString() === productId && (item.variantSku || '') === (variantSku || '')
    );

    if (existing) {
      const nextQuantity = existing.quantity + quantity;
      await inventoryService.assertAvailable(productId, variantSku, nextQuantity);
      existing.quantity = nextQuantity;
      existing.priceSnapshot = getProductPrice(product, variantSku);
      existing.productSnapshot = buildSnapshot(product);
    } else {
      cart.items.push({
        product: product._id,
        variantSku,
        quantity,
        priceSnapshot: getProductPrice(product, variantSku),
        productSnapshot: buildSnapshot(product)
      });
    }

    return this.recalculate(cart);
  },

  async updateItem(owner, { productId, variantSku, quantity }) {
    const cart = await this.getCart(owner);
    const item = cart.items.find(
      cartItem => cartItem.product._id.toString() === productId && (cartItem.variantSku || '') === (variantSku || '')
    );
    if (!item) throw ApiError.notFound('Cart item not found');
    await inventoryService.assertAvailable(productId, variantSku, quantity);
    item.quantity = quantity;
    return this.recalculate(cart);
  },

  async removeItem(owner, { productId, variantSku }) {
    const cart = await this.getCart(owner);
    cart.items = cart.items.filter(
      item => !(item.product._id.toString() === productId && (item.variantSku || '') === (variantSku || ''))
    );
    return this.recalculate(cart);
  },

  async clearCart(owner) {
    const cart = await this.getCart(owner);
    cart.items = [];
    cart.coupon = undefined;
    return this.recalculate(cart);
  },

  async applyCoupon(owner, code) {
    const cart = await this.getCart(owner);
    const subtotal = cart.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
    const { coupon, discount } = await couponService.validateCoupon({
      code,
      userId: cart.user,
      subtotal
    });
    cart.coupon = {
      code: coupon.code,
      couponId: coupon._id,
      discount
    };
    return this.recalculate(cart);
  },

  async removeCoupon(owner) {
    const cart = await this.getCart(owner);
    cart.coupon = undefined;
    return this.recalculate(cart);
  },

  async mergeGuestCart(userId, guestId) {
    if (!guestId) return this.getCart({ userId });
    const [userCart, guestCart] = await Promise.all([
      this.getCart({ userId }),
      Cart.findOne({ guestId }).populate('items.product', 'name slug sku images price stock variants status deletedAt')
    ]);
    if (!guestCart) return userCart;

    for (const item of guestCart.items) {
      const product = await Product.findById(item.product._id || item.product);
      if (!product) continue;
      const existing = userCart.items.find(
        userItem =>
          userItem.product._id.toString() === product._id.toString() &&
          (userItem.variantSku || '') === (item.variantSku || '')
      );
      if (existing) existing.quantity += item.quantity;
      else userCart.items.push(item);
    }

    await guestCart.deleteOne();
    return this.recalculate(userCart);
  }
};
