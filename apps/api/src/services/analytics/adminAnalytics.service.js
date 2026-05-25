import { Order } from '../../models/Order.js';
import { Product } from '../../models/Product.js';
import { User } from '../../models/User.js';
import { ORDER_STATUS } from '../../constants/enums.js';
import { inventoryService } from '../inventory/inventory.service.js';

export const adminAnalyticsService = {
  async dashboardStats() {
    const [
      totalUsers,
      activeProducts,
      lowStockProducts,
      orderStats,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ deletedAt: null }),
      Product.countDocuments({ deletedAt: null, status: 'active' }),
      inventoryService.listLowStock(10),
      Order.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [{ $in: ['$status', [ORDER_STATUS.PAID, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED]] }, '$pricing.total', 0]
              }
            },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$status', ORDER_STATUS.PENDING] }, 1, 0] } }
          }
        }
      ]),
      Order.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(8).lean({ virtuals: true })
    ]);

    return {
      totalUsers,
      activeProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      totalOrders: orderStats[0]?.totalOrders || 0,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
      pendingOrders: orderStats[0]?.pendingOrders || 0,
      recentOrders
    };
  },

  salesAnalytics({ from, to, groupBy = 'day' }) {
    const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';
    const match = { deletedAt: null };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    return Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
};
