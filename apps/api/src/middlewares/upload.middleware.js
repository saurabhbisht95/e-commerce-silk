import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  },
  fileFilter(_req, file, callback) {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(ApiError.badRequest('Only JPEG, PNG, WEBP and AVIF images are allowed'));
    }
    return callback(null, true);
  }
});
