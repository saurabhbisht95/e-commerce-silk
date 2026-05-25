import { Router } from 'express';
import addressRoutes from './address.routes.js';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import cartRoutes from './cart.routes.js';
import categoryRoutes from './category.routes.js';
import couponRoutes from './coupon.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import productRoutes from './product.routes.js';
import reviewRoutes from './review.routes.js';
import securityRoutes from './security.routes.js';
import uploadRoutes from './upload.routes.js';
import userRoutes from './user.routes.js';
import wishlistRoutes from './wishlist.routes.js';

const router = Router();

router.use('/security', securityRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', paymentRoutes);
router.use('/uploads', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
