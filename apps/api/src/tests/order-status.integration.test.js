import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ORDER_STATUS, PAYMENT_STATUS, USER_ROLES } from '../constants/enums.js';
import { orderService } from '../services/order/order.service.js';

describe('order status updates', () => {
  it('updates status for older orders and restores stock when cancelled', async () => {
    const category = await Category.create({ name: 'Kurtas', slug: 'kurtas' });
    const product = await Product.create({
      name: 'Legacy Kurta',
      slug: 'legacy-kurta',
      sku: 'LEGACY-KURTA',
      category: category._id,
      price: 1200,
      stock: 3,
      status: 'active'
    });
    const customer = await User.create({
      name: 'Customer',
      email: 'customer@example.com',
      password: 'StrongPass123',
      roles: [USER_ROLES.USER],
      isEmailVerified: true
    });
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'StrongPass123',
      roles: [USER_ROLES.SUPER_ADMIN],
      isEmailVerified: true
    });
    const orderId = new mongoose.Types.ObjectId();

    await Order.collection.insertOne({
      _id: orderId,
      orderNumber: 'DS-LEGACY-1',
      user: customer._id,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: '9999999999'
      },
      items: [{
        product: product._id,
        sku: product.sku,
        name: product.name,
        quantity: 2,
        unitPrice: 1200,
        total: 2400
      }],
      shippingAddress: {
        fullName: customer.name,
        phone: '9999999999',
        line1: 'Rajpur Road',
        city: 'Dehradun',
        state: 'Uttarakhand',
        postalCode: '248001',
        country: 'India'
      },
      pricing: {
        subtotal: 2400,
        discount: 0,
        shipping: 0,
        tax: 0,
        total: 2400
      },
      status: ORDER_STATUS.PROCESSING,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const order = await orderService.updateStatus(orderId.toString(), {
      status: ORDER_STATUS.CANCELLED,
      note: 'Customer requested cancellation.',
      actorId: admin._id
    });

    const updatedProduct = await Product.findById(product._id);
    expect(order.status).toBe(ORDER_STATUS.CANCELLED);
    expect(order.payment.status).toBe(PAYMENT_STATUS.PENDING);
    expect(order.statusHistory.at(-1).status).toBe(ORDER_STATUS.CANCELLED);
    expect(order.cancellation.reason).toBe('Customer requested cancellation.');
    expect(updatedProduct.stock).toBe(5);
  });
});
