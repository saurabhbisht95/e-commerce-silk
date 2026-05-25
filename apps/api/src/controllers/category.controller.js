import { categoryService } from '../services/category/category.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const categoryController = {
  list: asyncHandler(async (req, res) => {
    const categories = await categoryService.listCategories(req.query);
    sendSuccess(res, 200, 'Categories fetched successfully', { categories });
  }),

  create: asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    sendCreated(res, 'Category created successfully', { category });
  }),

  update: asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    sendSuccess(res, 200, 'Category updated successfully', { category });
  }),

  remove: asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    sendSuccess(res, 200, 'Category deleted successfully');
  })
};
