import { Cart } from '../models/Cart.js';
import { BaseRepository } from './BaseRepository.js';

export const CART_PRODUCT_FIELDS =
  'legacyId name slug sku category images price displayPrice currency stock variants status deletedAt';

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  findByOwner({ userId, guestId }) {
    const filter = userId ? { user: userId } : { guestId };
    return Cart.findOne(filter).populate('items.product', CART_PRODUCT_FIELDS);
  }
}

export const cartRepository = new CartRepository();
