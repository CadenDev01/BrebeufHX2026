import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate limit: 1 request per second for Nominatim
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Cache to avoid duplicate geocoding requests
const geocodeCache = new Map();

async function geocode(location, city, region) {
  const query = `${location}, ${city}, ${region}, Canada`;

  if (geocodeCache.has(query)) {
    return geocodeCache.get(query);
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Sportify-Hackathon/1.0'
      }
    });

    const data = await response.json();

    if (data && data.length > 0) {
      const result = { lat: data[0].lat, lon: data[0].lon };
      geocodeCache.set(query, result);
      return result;
    }

    // Try with just city and region
    const fallbackQuery = `${city}, ${region}, Canada`;
    if (!geocodeCache.has(fallbackQuery)) {
      await delay(1000);
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&limit=1`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Sportify-Hackathon/1.0'
        }
      });
      const fallbackData = await fallbackResponse.json();

      if (fallbackData && fallbackData.length > 0) {
        const result = { lat: fallbackData[0].lat, lon: fallbackData[0].lon };
        geocodeCache.set(fallbackQuery, result);
        geocodeCache.set(query, result);
        return result;
      }
    }

    geocodeCache.set(query, null);
    return null;
  } catch (error) {
    console.error(`Geocoding error for ${query}:`, error.message);
    return null;
  }
}

async function main() {
  const inputPath = path.join(__dirname, 'csv', 'unified_sports.csv');
  const outputPath = path.join(__dirname, 'csv', 'unified_sports_geocoded.csv');

  console.log('Reading CSV...');
  const fileContent = await fs.readFile(inputPath, 'utf-8');

  const rows = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${rows.length} rows. Starting geocoding...`);

  // Get unique locations to minimize API calls
  const uniqueLocations = new Map();
  for (const row of rows) {
    const key = `${row.sport_location}|${row.city}|${row.region}`;
    if (!uniqueLocations.has(key)) {
      uniqueLocations.set(key, { location: row.sport_location, city: row.city, region: row.region });
    }
  }

  console.log(`Found ${uniqueLocations.size} unique locations to geocode.`);

  let processed = 0;
  for (const [key, loc] of uniqueLocations) {
    const coords = await geocode(loc.location, loc.city, loc.region);
    if (coords) {
      uniqueLocations.set(key, { ...loc, ...coords });
    }
    processed++;
    if (processed % 10 === 0) {
      console.log(`Processed ${processed}/${uniqueLocations.size} locations...`);
    }
    await delay(1100); // Respect rate limit
  }

  // Update rows with coordinates
  const updatedRows = rows.map(row => {
    const key = `${row.sport_location}|${row.city}|${row.region}`;
    const loc = uniqueLocations.get(key);
    return {
      ...row,
      latitude: loc?.lat || '',
      longitude: loc?.lon || ''
    };
  });

  // Write output
  const output = stringify(updatedRows, { header: true });
  await fs.writeFile(outputPath, output);

  console.log(`Done! Output written to ${outputPath}`);

  // Count results
  const withCoords = updatedRows.filter(r => r.latitude && r.longitude).length;
  console.log(`${withCoords}/${rows.length} rows have coordinates.`);
}

main().catch(console.error);
