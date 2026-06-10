import { reverseGeocodeService } from '../services/location/reverseGeocode.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const locationController = {
  reverse: asyncHandler(async (req, res) => {
    const address = await reverseGeocodeService.reverse(req.query);
    sendSuccess(res, 200, 'Location resolved successfully', { address });
  })
};
