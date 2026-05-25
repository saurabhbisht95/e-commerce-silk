import { Router } from 'express';
import { bannerController } from '../controllers/banner.controller.js';
import { authenticate, authorizeAtLeast, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { USER_ROLES } from '../constants/enums.js';
import { idParamSchema } from '../validators/common.schema.js';
import { bannerCreateSchema, bannerQuerySchema, bannerUpdateSchema } from '../validators/banner.schema.js';

const router = Router();

router.get('/', optionalAuthenticate, validate({ query: bannerQuerySchema }), bannerController.list);
router.post('/', authenticate, authorizeAtLeast(USER_ROLES.ADMIN), validate({ body: bannerCreateSchema }), bannerController.create);
router.put(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema, body: bannerUpdateSchema }),
  bannerController.update
);
router.delete(
  '/:id',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  validate({ params: idParamSchema }),
  bannerController.remove
);

export default router;
