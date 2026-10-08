import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nd_career_exchange';
  
  try {
    // Attempt standard connection first with 3 second timeout
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`[Database] Connected successfully to MongoDB at ${uri}`);
  } catch (err: any) {
    console.warn(`[Database] Could not connect to external MongoDB (${err.message}). Starting embedded high-performance MongoDB instance...`);
    try {
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to embedded in-memory MongoDB at ${memoryUri}`);
    } catch (memErr: any) {
      console.error('[Database] Critical error initializing database:', memErr);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
