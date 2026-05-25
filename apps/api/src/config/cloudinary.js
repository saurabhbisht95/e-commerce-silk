import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';

const isCloudinaryConfigured =
  Boolean(config.CLOUDINARY_CLOUD_NAME) &&
  Boolean(config.CLOUDINARY_API_KEY) &&
  Boolean(config.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export { cloudinary, isCloudinaryConfigured };
