import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Mock the server connection to prevent real DB connection during tests
jest.mock('../server', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  // Disconnect any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Create and start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
}, 30000); // 30 second timeout for setup

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000); // 30 second timeout for teardown

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
