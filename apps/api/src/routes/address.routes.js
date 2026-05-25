import { Router } from 'express';
import { addressController } from '../controllers/address.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { addressSchema, addressUpdateSchema } from '../validators/address.schema.js';
import { idParamSchema } from '../validators/common.schema.js';

const router = Router();

router.use(authenticate);
router.get('/', addressController.list);
router.post('/', validate({ body: addressSchema }), addressController.create);
router.put('/:id', validate({ params: idParamSchema, body: addressUpdateSchema }), addressController.update);
router.delete('/:id', validate({ params: idParamSchema }), addressController.remove);
router.patch('/:id/default', validate({ params: idParamSchema }), addressController.setDefault);

export default router;
