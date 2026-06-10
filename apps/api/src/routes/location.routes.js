import { Router } from 'express';
import { locationController } from '../controllers/location.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { reverseGeocodeQuerySchema } from '../validators/location.schema.js';

const router = Router();

router.use(authenticate);
router.get('/reverse', validate({ query: reverseGeocodeQuerySchema }), locationController.reverse);

export default router;
