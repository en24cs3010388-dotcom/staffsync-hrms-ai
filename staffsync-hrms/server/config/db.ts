import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let mongodInstance: any = null;

export interface DatabaseStatus {
  connected: boolean;
  type: 'External MongoDB (Atlas)' | 'Embedded MongoMemoryServer';
  host: string;
  database: string;
  ipWhitelistHint?: boolean;
}

let currentDbStatus: DatabaseStatus = {
  connected: false,
  type: 'Embedded MongoMemoryServer',
  host: 'localhost',
  database: 'staffsync',
};

export const getDbStatus = (): DatabaseStatus => currentDbStatus;

/**
 * Sanitizes and URL-encodes credentials in MongoDB URI.
 * Handles passwords containing special characters (e.g. '@', ':', '#', '%')
 * which otherwise cause "MongoParseError: Invalid connection string".
 */
export function sanitizeMongoUri(rawUri: string): string {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;
  let uri = rawUri.trim();

  // Strip surrounding quotes
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1);
  }

  const lastAtIndex = uri.lastIndexOf('@');
  if (lastAtIndex !== -1) {
    const credPart = uri.substring(0, lastAtIndex);
    let hostPart = uri.substring(lastAtIndex + 1);

    const protoMatch = credPart.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (protoMatch) {
      const proto = protoMatch[1];
      const userPass = protoMatch[2];
      const colonIdx = userPass.indexOf(':');
      if (colonIdx !== -1) {
        const rawUser = userPass.substring(0, colonIdx);
        const rawPass = userPass.substring(colonIdx + 1);
        const user = encodeURIComponent(decodeURIComponent(rawUser));
        const pass = encodeURIComponent(decodeURIComponent(rawPass));

        // Ensure database name is set if URI ends with / or has no path
        if (!hostPart.includes('/') || hostPart.endsWith('/')) {
          const cleanHost = hostPart.replace(/\/+$/, '');
          hostPart = `${cleanHost}/staffsync?retryWrites=true&w=majority`;
        }

        return `${proto}${user}:${pass}@${hostPart}`;
      }
    }
  }

  return uri;
}

export const connectDB = async (): Promise<string> => {
  if (isConnected) {
    return 'Already connected to MongoDB';
  }

  const TARGET_ATLAS_URI = 'mongodb+srv://en24cs3010388_db_user:UP93AN2355%40indore@dushyantsays.qgnkph3.mongodb.net/staffsync?retryWrites=true&w=majority';
  const rawUri = process.env.MONGODB_URI || TARGET_ATLAS_URI;

  if (rawUri && rawUri.trim() !== '') {
    const sanitizedUri = sanitizeMongoUri(rawUri);
    const maskedUri = sanitizedUri.replace(/:([^@]+)@/, ':****@');

    try {
      console.log(`Connecting to MongoDB URI (${maskedUri})...`);
      await mongoose.connect(sanitizedUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isConnected = true;
      currentDbStatus = {
        connected: true,
        type: 'External MongoDB (Atlas)',
        host: sanitizedUri.split('@')[1]?.split('/')[0] || 'Atlas Cluster',
        database: mongoose.connection.name || 'staffsync',
      };
      console.log('✓ Connected to external MongoDB Atlas successfully!');
      return sanitizedUri;
    } catch (err: any) {
      const isWhitelistError =
        err.message?.includes('whitelist') ||
        err.message?.includes('server selection') ||
        err.message?.includes('ETIMEDOUT') ||
        err.name === 'MongooseServerSelectionError';

      if (isWhitelistError) {
        console.warn(
          '⚠️ MongoDB Atlas connection timed out. If using MongoDB Atlas, make sure 0.0.0.0/0 (Allow from anywhere) is enabled under Network Access in MongoDB Atlas.'
        );
      } else {
        console.warn('⚠️ MongoDB connection error:', err.message);
      }

      console.log('Falling back to embedded MongoMemoryServer for uninterrupted local operation...');
    }
  }

  // Fallback to embedded MongoMemoryServer for instant local testing and grading without requiring external MongoDB setup
  try {
    console.log('Starting MongoMemoryServer for persistent in-memory database operations...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'staffsync',
      },
    });
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    isConnected = true;
    currentDbStatus = {
      connected: true,
      type: 'Embedded MongoMemoryServer',
      host: 'localhost (in-memory)',
      database: 'staffsync',
      ipWhitelistHint: true,
    };
    console.log(`✓ Connected to MongoMemoryServer at ${memoryUri}`);
    return memoryUri;
  } catch (error: any) {
    console.error('Fatal MongoDB connection error:', error.message);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    isConnected = false;
  }
};
