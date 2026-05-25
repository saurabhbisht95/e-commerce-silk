import { adminAnalyticsService } from '../services/analytics/adminAnalytics.service.js';
import { inventoryService } from '../services/inventory/inventory.service.js';
import { userService } from '../services/user/user.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminController = {
  dashboard: asyncHandler(async (_req, res) => {
    const stats = await adminAnalyticsService.dashboardStats();
    sendSuccess(res, 200, 'Dashboard stats fetched successfully', { stats });
  }),

  salesAnalytics: asyncHandler(async (req, res) => {
    const analytics = await adminAnalyticsService.salesAnalytics(req.query);
    sendSuccess(res, 200, 'Sales analytics fetched successfully', { analytics });
  }),

  lowStock: asyncHandler(async (_req, res) => {
    const products = await inventoryService.listLowStock(100);
    sendSuccess(res, 200, 'Low stock products fetched successfully', { products });
  }),

  listUsers: asyncHandler(async (req, res) => {
    const result = await userService.listUsers(req.query);
    sendSuccess(res, 200, 'Users fetched successfully', { users: result.items }, result.meta);
  }),

  updateUser: asyncHandler(async (req, res) => {
    const user = await userService.updateUserStatus(req.params.id, req.body);
    sendSuccess(res, 200, 'User updated successfully', { user });
  })
};
