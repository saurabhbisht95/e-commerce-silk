import { Router } from 'express';
import { couponController } from '../controllers/coupon.controller.js';
import { authenticate, authorizeAtLeast, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { idParamSchema } from '../validators/common.schema.js';
import {
  couponCreateSchema,
  couponListQuerySchema,
  couponUpdateSchema,
  couponValidateSchema
} from '../validators/coupon.schema.js';

const router = Router();

router.post('/validate', optionalAuthenticate, validate({ body: couponValidateSchema }), couponController.validate);
router.get('/', authenticate, authorizeAtLeast(USER_ROLES.ADMIN), validate({ query: couponListQuerySchema }), couponController.list);
router.post('/', authenticate, authorizeAtLeast(USER_ROLES.ADMIN), validate({ body: couponCreateSchema }), couponController.create);
router.put(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema, body: couponUpdateSchema }),
  couponController.update
);
router.delete(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema }),
  couponController.remove
);

export default router;
