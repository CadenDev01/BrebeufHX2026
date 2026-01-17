import process from 'node:process';
import { db } from '../db.mjs';

try {
  process.loadEnvFile();
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn(err.message);
}
/**
 * Connects to MongoDB using env variable or default.
 * @param {string} [connectionName]
 */
export async function connectDb() {
  const conn = process.env.CONNECTION_NAME || 'Testdb';
  await db.connect(conn);
}

/**
 * Sets the collection for DB
 * @param {string} collectionName
 * */
export async function setDbCollection(collectionName) {
  if (!collectionName) throw new Error('Missing collection name');
  await db.setCollection(collectionName);
}

/**
 
Closes the DB connection*/
export async function closeDb() {
  if(db && db.instance){
    await db.close();
  }
}