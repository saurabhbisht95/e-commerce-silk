import { User } from '../models/User.js';
import { BaseRepository } from './BaseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findActiveByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase(), deletedAt: null });
    if (includePassword) query.select('+password +passwordResetToken +emailVerificationToken');
    return query;
  }

  listCustomers(query) {
    const filter = { deletedAt: null };
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { email: new RegExp(query.search, 'i') },
        { phone: new RegExp(query.search, 'i') }
      ];
    }
    if (query.role) filter.roles = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    return this.paginate({ filter, query, sort: '-createdAt' });
  }
}

export const userRepository = new UserRepository();
