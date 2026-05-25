import { Category } from '../models/Category.js';
import { BaseRepository } from './BaseRepository.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  listTree() {
    return Category.find({ deletedAt: null, isActive: true })
      .sort({ parent: 1, sortOrder: 1, name: 1 })
      .lean({ virtuals: true });
  }

  findBySlug(slug) {
    return Category.findOne({ slug, deletedAt: null });
  }
}

export const categoryRepository = new CategoryRepository();
