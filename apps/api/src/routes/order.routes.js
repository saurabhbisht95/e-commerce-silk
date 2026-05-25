import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { authenticate, authorizeAtLeast } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
  cancelOrderSchema,
  orderCreateSchema,
  orderListQuerySchema,
  returnOrderSchema,
  updateOrderStatusSchema
} from '../validators/order.schema.js';

const router = Router();

router.use(authenticate);
router.post('/', validate({ body: orderCreateSchema }), orderController.create);
router.get('/me', validate({ query: orderListQuerySchema }), orderController.myOrders);
router.get('/me/:id', validate({ params: idParamSchema }), orderController.getMine);
router.post('/me/:id/cancel', validate({ params: idParamSchema, body: cancelOrderSchema }), orderController.cancelMine);
router.post('/me/:id/return', validate({ params: idParamSchema, body: returnOrderSchema }), orderController.returnMine);
router.post('/me/:id/reorder', validate({ params: idParamSchema }), orderController.reorder);

router.get('/', authorizeAtLeast(USER_ROLES.ADMIN), validate({ query: orderListQuerySchema }), orderController.listAdmin);
router.get('/:id', authorizeAtLeast(USER_ROLES.ADMIN), validate({ params: idParamSchema }), orderController.getAdmin);
router.patch(
  '/:id/status',
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema, body: updateOrderStatusSchema }),
  orderController.updateStatus
);
router.post('/:id/invoice', authorizeAtLeast(USER_ROLES.ADMIN), validate({ params: idParamSchema }), orderController.invoice);

export default router;
