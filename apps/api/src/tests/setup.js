import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      port: 27019
    }
  });
  await mongoose.connect(mongoServer.getUri(), { dbName: 'doon_silk_test' });
});

afterEach(async () => {
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map(collection => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
