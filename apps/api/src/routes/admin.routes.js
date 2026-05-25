import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate, authorizeAtLeast } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { idParamSchema } from '../validators/common.schema.js';
import { salesAnalyticsQuerySchema } from '../validators/admin.schema.js';
import { userListQuerySchema, updateUserStatusSchema } from '../validators/user.schema.js';

const router = Router();

router.use(authenticate, authorizeAtLeast(USER_ROLES.ADMIN));
router.get('/dashboard', adminController.dashboard);
router.get('/analytics/sales', validate({ query: salesAnalyticsQuerySchema }), adminController.salesAnalytics);
router.get('/inventory/low-stock', adminController.lowStock);
router.get('/users', validate({ query: userListQuerySchema }), adminController.listUsers);
router.patch('/users/:id', validate({ params: idParamSchema, body: updateUserStatusSchema }), adminController.updateUser);

export default router;
