import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller.js';
import { authenticate, authorizeAtLeast } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { USER_ROLES } from '../constants/enums.js';

const router = Router();

router.post(
  '/images',
  authenticate,
  authorizeAtLeast(USER_ROLES.ADMIN),
  upload.array('images', 10),
  uploadController.images
);

export default router;
