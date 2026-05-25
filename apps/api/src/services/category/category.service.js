import { Category } from '../../models/Category.js';
import { categoryRepository } from '../../repositories/category.repository.js';
import { ApiError } from '../../utils/ApiError.js';
import { createSlug } from '../../utils/slug.js';

const buildTree = categories => {
  const byId = new Map(categories.map(category => [category._id.toString(), { ...category, children: [] }]));
  const roots = [];

  for (const category of byId.values()) {
    const parentId = category.parent?.toString();
    if (parentId && byId.has(parentId)) byId.get(parentId).children.push(category);
    else roots.push(category);
  }

  return roots;
};

export const categoryService = {
  async listCategories({ tree = false } = {}) {
    const categories = await categoryRepository.listTree();
    return tree ? buildTree(categories) : categories;
  },

  async createCategory(payload) {
    const category = await Category.create({
      ...payload,
      slug: payload.slug || createSlug(payload.name)
    });
    return category;
  },

  async updateCategory(id, payload) {
    const update = { ...payload };
    if (payload.name && !payload.slug) update.slug = createSlug(payload.name);
    const category = await Category.findOneAndUpdate(
      { _id: id, deletedAt: null },
      update,
      { new: true, runValidators: true }
    );
    if (!category) throw ApiError.notFound('Category not found');
    return category;
  },

  async deleteCategory(id) {
    const category = await Category.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );
    if (!category) throw ApiError.notFound('Category not found');
    return category;
  }
};
