import { addressService } from '../services/user/address.service.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addressController = {
  list: asyncHandler(async (req, res) => {
    const addresses = await addressService.list(req.user._id);
    sendSuccess(res, 200, 'Addresses fetched successfully', { addresses });
  }),

  create: asyncHandler(async (req, res) => {
    const address = await addressService.create(req.user._id, req.body);
    sendCreated(res, 'Address created successfully', { address });
  }),

  update: asyncHandler(async (req, res) => {
    const address = await addressService.update(req.user._id, req.params.id, req.body);
    sendSuccess(res, 200, 'Address updated successfully', { address });
  }),

  remove: asyncHandler(async (req, res) => {
    await addressService.remove(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Address deleted successfully');
  }),

  setDefault: asyncHandler(async (req, res) => {
    const address = await addressService.setDefault(req.user._id, req.params.id);
    sendSuccess(res, 200, 'Default address updated successfully', { address });
  })
};
