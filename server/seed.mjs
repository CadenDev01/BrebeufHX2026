import { db } from './db/DB.mjs';
import fs from 'fs/promises';
//https://csv.js.org/parse/api/sync/
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';
import {setDbCollection, connectDb, closeDb} from './dbConnection.mjs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for coordinates to avoid duplicate API calls
const coordinateCache = new Map();

/**
 * Get coordinates of a location using Nominatim API
 * @param {string} locationString - Full location string (e.g., "sport_location, city, region")
 * @returns {Promise<{latitude: string, longitude: string}|null>}
 */
async function getCoordinates(locationString) {
  // Check cache first
  if (coordinateCache.has(locationString)) {
    return coordinateCache.get(locationString);
  }

  // Encode the location for URL
  const query = encodeURIComponent(locationString);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Sportify/1.0 (sports-finder-app)'
      }
    });

    const data = await response.json();

    if (data.length > 0) {
      const location = data[0];
      const coords = {
        latitude: location.lat,
        longitude: location.lon
      };

      // Cache the result
      coordinateCache.set(locationString, coords);

      // Be nice to Nominatim - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

      return coords;
    } else {
      coordinateCache.set(locationString, null);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching coordinates for "${locationString}":`, error.message);
    return null;
  }
}

/**
 * Enrich rows with coordinates from Nominatim API
 * @param {Object[]} rows - Parsed CSV rows
 * @param {boolean} fixCoordinates - Whether to fetch missing coordinates
 * @param {number} maxToFix - Maximum number of coordinates to fix (0 = unlimited)
 * @param {string} cityFilter - Only fix coordinates for this city (empty = all cities)
 * @returns {Promise<Object[]>} Enriched rows
 */
async function enrichWithCoordinates(rows, fixCoordinates = true, maxToFix = 0, cityFilter = '') {
  if (!fixCoordinates) {
    return rows;
  }

  console.log(`\n🌍 Enriching ${rows.length} rows with coordinates...`);
  if (cityFilter) {
    console.log(`   🏙️  City filter: "${cityFilter}" (only fixing this city)`);
  }
  if (maxToFix > 0) {
    console.log(`   ⚠️  Limited to fixing ${maxToFix} coordinates (use --max=0 for unlimited)\n`);
  }

  let fixed = 0;
  let skipped = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Skip if coordinates already exist and are valid
    if (row.latitude && row.longitude && row.latitude.trim() !== '' && row.longitude.trim() !== '') {
      skipped++;
      continue;
    }

    // Skip if city filter is set and this row doesn't match
    if (cityFilter && row.city && row.city.toLowerCase() !== cityFilter.toLowerCase()) {
      skipped++;
      continue;
    }

    // Stop if we've reached the maximum
    if (maxToFix > 0 && fixed >= maxToFix) {
      console.log(`\n   ⏹️  Reached limit of ${maxToFix} fixes. Stopping coordinate fetching.`);
      break;
    }

    // Build location string from available fields
    const locationParts = [
      row.sport_location,
      row.city,
      row.region
    ].filter(part => part && part.trim() !== '');

    if (locationParts.length === 0) {
      failed++;
      console.log(`   ⚠️  Row ${i + 1}: No location data available`);
      continue;
    }

    const locationString = locationParts.join(', ');
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const avgTime = fixed > 0 ? elapsed / fixed : 1;
    const remaining = maxToFix > 0 ? Math.max(0, maxToFix - fixed) : (rows.length - i);
    const eta = Math.floor(avgTime * remaining);

    console.log(`   🔍 [${i + 1}/${rows.length}] Fixed: ${fixed} | ETA: ${eta}s | "${locationString.substring(0, 50)}..."`);

    const coords = await getCoordinates(locationString);

    if (coords) {
      row.latitude = coords.latitude;
      row.longitude = coords.longitude;
      fixed++;
    } else {
      failed++;
    }
  }

  const totalTime = Math.floor((Date.now() - startTime) / 1000);

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ⏭️  Skipped (already had coords): ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📍 Total: ${rows.length}`);
  console.log(`   ⏱️  Time taken: ${totalTime}s (${Math.floor(totalTime / 60)}m ${totalTime % 60}s)\n`);

  return rows;
}

/**
 * Main seed function
 * @param {string} csvFile - CSV file path
 * @param {string} collectionName - Mongo collection
 * @param {boolean} fixCoordinates - Whether to fetch missing coordinates (default: true)
 * @param {number} maxToFix - Maximum number of coordinates to fix (0 = unlimited)
 * @param {string} cityFilter - Only fix coordinates for this city (empty = all cities)
 */
export async function seed(csvFile, collectionName, fixCoordinates = true, maxToFix = 0, cityFilter = '') {
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
    let rows = await readAndParseCsv(filePath);

    // Enrich with coordinates if enabled
    if (fixCoordinates) {
      rows = await enrichWithCoordinates(rows, fixCoordinates, maxToFix, cityFilter);
    }

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
 * "node seed.mjs [name of csv file] [collection name] [--fix-coords] [--max=N] [--city=NAME]"
 *
 * Examples:
 *   node seed.mjs csv/unified_sports.csv sports --no-fix
 *   node seed.mjs csv/unified_sports.csv sports --max=10
 *   node seed.mjs csv/unified_sports.csv sports --city=sherbrooke
 *   node seed.mjs csv/unified_sports.csv sports --city=montreal --max=50
*/
if(path.basename(process.argv[1]) === 'seed.mjs'){
  const args = process.argv.slice(2);
  const csvFile = args[0];
  const collectionName = args[1];

  // Check for --fix-coords or --no-fix flag
  const fixCoordinates = !args.includes('--no-fix');

  // Check for --max=N flag
  let maxToFix = 0; // 0 = unlimited
  const maxArg = args.find(arg => arg.startsWith('--max='));
  if (maxArg) {
    maxToFix = parseInt(maxArg.split('=')[1], 10);
    if (isNaN(maxToFix) || maxToFix < 0) {
      console.error('Invalid --max value. Must be a positive number.');
      process.exit(1);
    }
  }

  // Check for --city=NAME flag
  let cityFilter = '';
  const cityArg = args.find(arg => arg.startsWith('--city='));
  if (cityArg) {
    cityFilter = cityArg.split('=')[1];
  }

  if (!csvFile || !collectionName) {
    console.error('Usage: node seed.mjs <csv-file> <collection-name> [--no-fix] [--max=N] [--city=NAME]');
    console.error('Examples:');
    console.error('  node seed.mjs csv/unified_sports.csv sports --max=10              (test with 10)');
    console.error('  node seed.mjs csv/unified_sports.csv sports --city=sherbrooke     (all Sherbrooke)');
    console.error('  node seed.mjs csv/unified_sports.csv sports --city=montreal --max=50');
    console.error('  node seed.mjs csv/unified_sports.csv sports --no-fix              (skip coords)');
    process.exit(1);
  }

  console.log('🌱 Starting seed process...');
  console.log(`   📄 CSV File: ${csvFile}`);
  console.log(`   📦 Collection: ${collectionName}`);
  console.log(`   🌍 Fix Coordinates: ${fixCoordinates ? 'YES' : 'NO'}`);
  if (cityFilter) {
    console.log(`   🏙️  City Filter: ${cityFilter}`);
  }
  if (fixCoordinates && maxToFix > 0) {
    console.log(`   🎯 Max to fix: ${maxToFix}`);
  } else if (fixCoordinates) {
    console.log(`   ⚠️  Max to fix: UNLIMITED${cityFilter ? ' (for ' + cityFilter + ' only)' : ' (this will take a LONG time!)'}`);
  }
  console.log('');

  seed(csvFile, collectionName, fixCoordinates, maxToFix, cityFilter).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}