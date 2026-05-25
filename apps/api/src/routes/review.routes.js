import { Router } from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { authenticate, authorizeAtLeast } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { idParamSchema, paginationQuerySchema } from '../validators/common.schema.js';
import { reviewCreateSchema, reviewModerationSchema, reviewUpdateSchema } from '../validators/review.schema.js';

const router = Router();

router.get('/products/:id', validate({ params: idParamSchema, query: paginationQuerySchema }), reviewController.listForProduct);
router.post('/products/:id', authenticate, validate({ params: idParamSchema, body: reviewCreateSchema }), reviewController.create);
router.patch('/:id', authenticate, validate({ params: idParamSchema, body: reviewUpdateSchema }), reviewController.update);
router.delete('/:id', authenticate, validate({ params: idParamSchema }), reviewController.remove);
router.patch(
  '/:id/moderate',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema, body: reviewModerationSchema }),
  reviewController.moderate
);

export default router;
