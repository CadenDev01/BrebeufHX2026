import { MongoClient, ServerApiVersion } from 'mongodb';
// this is not needed for this version of node but I want it to be able to run earlier versions
import process from 'node:process'; 
process.loadEnvFile();

const dbUrl = process.env.ATLAS_URI;
const cluster = process.env.CLUSTER;

if (!dbUrl) {
  throw new Error('Please set the ATLAS_URI environment variable');
}

// Singleton instance
let instance = null;

export class DB {
  constructor() {
    if (!instance) {
      instance = this;
      this.mongoClient = null;
      this.db = null;
      this.collection = null;
    }
    return instance;
  }

  // Connect to a database (lazy)
  async connect(dbName = cluster) {
    if (this.db) return;

    this.mongoClient = new MongoClient(dbUrl, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });


    await this.mongoClient.connect();
    this.db = await this.mongoClient.db(dbName);

    // Ping to verify connection
    await this.db.command({ ping: 1 });
    console.log('connected');

  }

  // Set the active collection
  async setCollection(collectionName) {
    if (!instance.db) throw new Error('DB not connected. Call connect() first.');
    instance.collection = instance.db.collection(collectionName);
    console.log(`Collection set to ${collectionName}`);
  }

  // This basically uses the .drop to remove the collection
  async dropCollection(collectionName) {
    if (!instance.db) throw new Error('DB not connected. Call connect() first.');
    // list connections: https://www.mongodb.com/docs/manual/reference/command/listCollections/
    const collections = await instance.db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      // .drop source : https://www.mongodb.com/docs/manual/reference/method/db.collection.drop/
      await instance.db.collection(collectionName).drop();
      console.log(`Dropped collection ${collectionName}`);
    }
  }

  // gracefully
  async close() {
    if (instance.mongoClient) {
      await instance.mongoClient.close();
      this.db = null;
      this.collection = null;
      console.log('MongoDB connection closed.');
    }

    if (instance.secondMongoClient) {
      await instance.secondMongoClient.close();
      this.secondDB = null;
      this.secondCollection = null;
    }
  }
}

// Export singleton instance
export const db = new DB();
