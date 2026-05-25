import { Cart } from '../models/Cart.js';
import { BaseRepository } from './BaseRepository.js';

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  findByOwner({ userId, guestId }) {
    const filter = userId ? { user: userId } : { guestId };
    return Cart.findOne(filter).populate('items.product', 'name slug sku images price stock variants status deletedAt');
  }
}

export const cartRepository = new CartRepository();
