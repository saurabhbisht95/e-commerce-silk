import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { cloudinary, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { config } from '../../config/env.js';

const uploadBuffer = file =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: config.CLOUDINARY_FOLDER,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });

const extensionByMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif'
};

const uploadLocal = async (file, index) => {
  const uploadDir = path.resolve('public/uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = extensionByMime[file.mimetype] || path.extname(file.originalname) || '.jpg';
  const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, file.buffer);

  return {
    url: `${config.API_BASE_URL}/uploads/${fileName}`,
    publicId: `local/${fileName}`,
    alt: file.originalname,
    position: index
  };
};

export const uploadService = {
  async uploadImages(files = []) {
    if (isCloudinaryConfigured) {
      const uploaded = await Promise.all(files.map(uploadBuffer));
      return uploaded.map((item, index) => ({
        url: item.secure_url,
        publicId: item.public_id,
        alt: files[index].originalname,
        position: index
      }));
    }

    return Promise.all(files.map(uploadLocal));
  }
};
