import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { authenticate, authorizeAtLeast } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { idParamSchema } from '../validators/common.schema.js';
import { categoryCreateSchema, categoryQuerySchema, categoryUpdateSchema } from '../validators/category.schema.js';

const router = Router();

router.get('/', validate({ query: categoryQuerySchema }), categoryController.list);
router.post('/', authenticate, authorizeAtLeast(USER_ROLES.ADMIN), validate({ body: categoryCreateSchema }), categoryController.create);
router.put(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema, body: categoryUpdateSchema }),
  categoryController.update
);
router.delete(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema }),
  categoryController.remove
);

export default router;
