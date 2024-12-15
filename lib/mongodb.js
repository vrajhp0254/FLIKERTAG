// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  connectTimeoutMS: 10000
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log('Connected successfully to MongoDB in development mode');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('Connected successfully to MongoDB in production mode');
      return client;
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    });
}

// Add a test connection function
export async function testConnection() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    console.log("MongoDB connection test successful!");
    return true;
  } catch (error) {
    console.error("MongoDB connection test failed:", error);
    return false;
  }
}

export default clientPromise;
