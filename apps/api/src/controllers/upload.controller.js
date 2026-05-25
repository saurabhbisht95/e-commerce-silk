import { uploadService } from '../services/upload/upload.service.js';
import { sendCreated } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadController = {
  images: asyncHandler(async (req, res) => {
    const images = await uploadService.uploadImages(req.files);
    sendCreated(res, 'Images uploaded successfully', { images });
  })
};
