import { db } from '../db/db.mjs';
import fs from 'fs/promises';
//https://csv.js.org/parse/api/sync/
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';
import {setDbCollection, connectDb, closeDb} from './dbConnection.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main seed function
 * @param {string} csvFile - CSV file path
 * @param {string} collectionName - Mongo collection
 */
export async function seed(csvFile, collectionName) {
  if (!csvFile || !collectionName) {
    throw new Error('Missing arguments');
  }
  // CSV is in the same folder as seed.js
  const filePath = path.join(__dirname, csvFile);
  try {
    //do db connection outside from seed.js , seperate module?
    await connectDb(collectionName);
    await setDbCollection(collectionName);

    // //put rows in helper, make test to test if rows is correct, stub fs.readfile
    const rows = await readAndParseCsv(filePath);
    // Insert into MongoDB
    if (rows.length > 0) {
      //stub db to check if createMany is called
      const numInserted = await db.createMany(rows);
      // eslint-disable-next-line no-console
      console.log(`Inserted ${numInserted} filtered records into MongoDB.`);
    } else {
      console.error('No records');
    }
  } catch (err) {
    console.error('Error processing CSV:', err);
  }finally {
    await closeDb();
  }
}

/**
 * Reads and parses a CSV file into an array of objects.
 * @param {string} filePath - Absolute path to the CSV file.\ 
 * @param {Function} readFileFn - function to read files (for testing)

 * @returns {Promise<Object[]>} Parsed rows.
 */
export async function readAndParseCsv(filePath, readFileFn = null) {
  const fileContent = readFileFn 
    ? await readFileFn(filePath)
    : await fs.readFile(filePath, 'utf-8');
  
  if (!fileContent) {
    return [];
  }  
  const rows = parse(fileContent, {
    columns: true,
    // eslint-disable-next-line camelcase
    skip_empty_lines: true,
    trim: true,
  });
  return rows;
}
/**
 * to add collection do:
 *  WARNING : you have to run the file from utils dir
 * "node seed.mjs [name of csv file] [collection name]"
*/
if(path.basename(process.argv[1]) === 'seed.mjs'){
  const [,, csvFile, collectionName] = process.argv;
  seed(csvFile, collectionName).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}