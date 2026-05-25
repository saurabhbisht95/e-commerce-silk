import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  await mongoose.connect(config.MONGODB_URI, {
    autoIndex: !config.isProduction,
    dbName: config.MONGODB_DB_NAME,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 20
  });

  logger.info({ database: mongoose.connection.name }, 'MongoDB connected');
  return mongoose.connection;
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  }
};
