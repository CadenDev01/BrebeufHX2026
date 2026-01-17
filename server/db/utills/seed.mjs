import { db } from '../DB.mjs';
import loadData from '../../data/loadData.mjs';
import process from 'node:process'; 
process.loadEnvFile();
const collection = process.env.COLLECTION;

/**
 * Seeds the GDP collection in MongoDB with data from the local JSON file.
 * Clears the collection first before inserting new documents.
 *
 * @author Philip Radoynovski
 */
async function seed() {

  try {
    await db.connect();
    await db.setCollection(collection);
    // In Case there is something there already, delete all documents there
    await db.collection.deleteMany({});
    console.log('Cleared existing documents from GDP collection.');

    const transformedData = await loadData();

    if (transformedData.length > 0) {
      const result = await db.collection.insertMany(transformedData);
      console.log(`Inserted ${result.insertedCount} documents.`);
    } else {
      console.log('No documents to insert.');
    }

    console.log('Database population complete.');
  } catch (err) {
    console.error('Error populating database:', err);
  }finally {
    await db.close();
    process.exit(0);
  }
}

seed();

export default seed;
