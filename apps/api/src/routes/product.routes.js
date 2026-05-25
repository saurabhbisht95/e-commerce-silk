import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { optionalAuthenticate, authenticate, authorizeAtLeast } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { idParamSchema, slugOrIdParamSchema } from '../validators/common.schema.js';
import {
  productCreateSchema,
  productQuerySchema,
  productUpdateSchema,
  stockAdjustSchema
} from '../validators/product.schema.js';

const router = Router();

router.get('/', optionalAuthenticate, validate({ query: productQuerySchema }), productController.list);
router.get('/featured', productController.featured);
router.get('/trending', productController.trending);
router.get('/:id/related', validate({ params: idParamSchema }), productController.related);
router.get('/:slugOrId', optionalAuthenticate, validate({ params: slugOrIdParamSchema }), productController.getBySlugOrId);

router.post(
  '/',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ body: productCreateSchema }),
  productController.create
);
router.put(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema, body: productUpdateSchema }),
  productController.update
);
router.delete(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema }),
  productController.remove
);
router.patch(
  '/:id/stock',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema, body: stockAdjustSchema }),
  productController.adjustStock
);

export default router;
