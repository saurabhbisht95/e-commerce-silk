import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema } from '../validators/common.schema.js';

const router = Router();

router.use(authenticate);
router.get('/', wishlistController.get);
router.post('/:id', validate({ params: idParamSchema }), wishlistController.add);
router.delete('/:id', validate({ params: idParamSchema }), wishlistController.remove);

export default router;
