import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import {
  cartItemSchema,
  couponApplySchema,
  guestQuerySchema,
  mergeCartSchema,
  removeCartItemSchema
} from '../validators/cart.schema.js';

const router = Router();

router.get('/', optionalAuthenticate, validate({ query: guestQuerySchema }), cartController.get);
router.post('/items', optionalAuthenticate, validate({ body: cartItemSchema }), cartController.addItem);
router.patch('/items', optionalAuthenticate, validate({ body: cartItemSchema }), cartController.updateItem);
router.delete('/items', optionalAuthenticate, validate({ body: removeCartItemSchema }), cartController.removeItem);
router.delete('/', optionalAuthenticate, validate({ query: guestQuerySchema }), cartController.clear);
router.post('/coupon', optionalAuthenticate, validate({ body: couponApplySchema }), cartController.applyCoupon);
router.delete('/coupon', optionalAuthenticate, validate({ query: guestQuerySchema }), cartController.removeCoupon);
router.post('/merge', authenticate, validate({ body: mergeCartSchema }), cartController.mergeGuest);

export default router;
