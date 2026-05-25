import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { profileUpdateSchema } from '../validators/user.schema.js';

const router = Router();

router.use(authenticate);
router.get('/me', userController.profile);
router.patch('/me', validate({ body: profileUpdateSchema }), userController.updateProfile);

export default router;
