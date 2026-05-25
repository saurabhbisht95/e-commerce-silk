import { orderService } from '../services/order/order.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const orderController = {
  create: asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.user, {
      ...req.body,
      idempotencyKey: req.headers['idempotency-key'] || req.body.idempotencyKey
    });
    sendCreated(res, 'Order created successfully', { order });
  }),

  myOrders: asyncHandler(async (req, res) => {
    const result = await orderService.listMyOrders(req.user._id, req.query);
    sendSuccess(res, 200, 'Orders fetched successfully', { orders: result.items }, result.meta);
  }),

  getMine: asyncHandler(async (req, res) => {
    const order = await orderService.getOrderForUser(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Order fetched successfully', { order });
  }),

  cancelMine: asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.user._id, req.params.id, req.body.reason);
    sendSuccess(res, 200, 'Order cancelled successfully', { order });
  }),

  returnMine: asyncHandler(async (req, res) => {
    const order = await orderService.requestReturn(req.user._id, req.params.id, req.body.reason);
    sendSuccess(res, 200, 'Return request submitted successfully', { order });
  }),

  listAdmin: asyncHandler(async (req, res) => {
    const result = await orderService.listOrders(req.query);
    sendSuccess(res, 200, 'Orders fetched successfully', { orders: result.items }, result.meta);
  }),

  getAdmin: asyncHandler(async (req, res) => {
    const order = await orderService.getOrderForAdmin(req.params.id);
    sendSuccess(res, 200, 'Order fetched successfully', { order });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const order = await orderService.updateStatus(req.params.id, {
      status: req.body.status,
      note: req.body.note,
      actorId: req.user._id
    });
    sendSuccess(res, 200, 'Order status updated successfully', { order });
  }),

  invoice: asyncHandler(async (req, res) => {
    const invoice = await orderService.generateInvoice(req.params.id);
    sendSuccess(res, 200, 'Invoice generated successfully', { invoice });
  }),

  reorder: asyncHandler(async (req, res) => {
    const cart = await orderService.reorder(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Items added to cart successfully', { cart });
  })
};
