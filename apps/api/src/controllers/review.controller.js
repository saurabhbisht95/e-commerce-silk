import { reviewService } from '../services/review/review.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reviewController = {
  listForProduct: asyncHandler(async (req, res) => {
    const result = await reviewService.listForProduct(req.params.id, req.query);
    sendSuccess(res, 200, 'Reviews fetched successfully', { reviews: result.items }, result.meta);
  }),

  create: asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(req.user._id, req.params.id, req.body);
    sendCreated(res, 'Review added successfully', { review });
  }),

  update: asyncHandler(async (req, res) => {
    const review = await reviewService.updateReview(req.user._id, req.params.id, req.body);
    sendSuccess(res, 200, 'Review updated successfully', { review });
  }),

  remove: asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Review deleted successfully');
  }),

  moderate: asyncHandler(async (req, res) => {
    const review = await reviewService.moderateReview(req.params.id, {
      ...req.body,
      response: req.body.response
        ? { ...req.body.response, respondedBy: req.user._id, respondedAt: new Date() }
        : undefined
    });
    sendSuccess(res, 200, 'Review moderated successfully', { review });
  })
};
