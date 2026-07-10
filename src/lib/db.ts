import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
export async function getDb() {
  const conn = await clientPromise;
  return conn.db(); // connects to default database in URI or 'test'
}
export async function getCollection(name: string) {
  const db = await getDb();
  const collection = db.collection(name);
  if (name === 'comments') {
    try {
      // Automatically purge documents older than 90 days (3 months)
      await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
    } catch (e) {
      console.error('Failed to create comments TTL index:', e);
    }
  }
  return collection;
}
export interface Certificate {
  _id?: string;
  name: string;
  issuer: string;
  dateIssued: string;
  credentialId: string;
  status: 'active' | 'expired';
  fileUrl: string;
  fileSize?: number;
  description?: string;
  customLabel?: string;
  createdAt: string;
}
