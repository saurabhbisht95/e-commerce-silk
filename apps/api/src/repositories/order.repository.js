import { Order } from '../models/Order.js';
import { BaseRepository } from './BaseRepository.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  listForUser(userId, query) {
    return this.paginate({
      filter: { user: userId, deletedAt: null },
      query,
      sort: '-createdAt'
    });
  }

  listForAdmin(query) {
    const filter = { deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.user) filter.user = query.user;
    if (query.search) {
      filter.$or = [
        { orderNumber: new RegExp(query.search, 'i') },
        { 'customer.email': new RegExp(query.search, 'i') },
        { 'customer.phone': new RegExp(query.search, 'i') }
      ];
    }
    return this.paginate({ filter, query, sort: query.sort || '-createdAt' });
  }
}

export const orderRepository = new OrderRepository();
