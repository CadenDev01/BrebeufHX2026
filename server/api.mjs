import express from 'express';
import path from 'path';
import compression from 'compression';
import {db} from 'db/DB.mjs';
import process from 'node:process'; 
if(db.db === null) await db.connect();
const PORT = process.env.PORT || 3000;
  
const app = express();
app.use(express.json());
app.use(express.json({ limit: '10kb' }));

app.use(compression());

app.use(express.static('./client/dist/'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./client/dist/index.html'));
});

///////////////////////////////////////////////////////

// Example allowed lists
const allowedSports = ['soccer', 'basketball', 'tennis'];
const allowedSportTypes = ['indoor', 'outdoor'];
const allowedCities = ['new york', 'los angeles', 'chicago'];
const allowedRegions = ['north', 'south', 'east', 'west'];

app.post('/search', async (req, res, next) => {
  try {
    const {
      sport,
      sportType,
      sportLocation,
      city,
      region = null,
      limit = null
    } = req.body;

    const query = {};

    // Validate sport
    if (sport !== undefined) {
      const sportNormalized = String(sport).trim().toLowerCase();
      if (!allowedSports.includes(sportNormalized)) {
        return res.status(400).json({ error: `"sport" must be one of: ${allowedSports.join(', ')}` });
      }
      query.sport = sportNormalized;
    }

    // Validate sportType
    if (sportType !== undefined) {
      const sportTypeNormalized = String(sportType).trim().toLowerCase();
      if (!allowedSportTypes.includes(sportTypeNormalized)) {
        return res.status(400).json({ error: `"sportType" must be one of: ${allowedSportTypes.join(', ')}` });
      }
      query.sportType = sportTypeNormalized;
    }

    // Validate sportLocation
    if (sportLocation !== undefined) {
      const locationNormalized = String(sportLocation).trim().toLowerCase();
      query.sportLocation = locationNormalized;
    }

    // Validate city
    if (city !== undefined) {
      const cityNormalized = String(city).trim().toLowerCase();
      if (!allowedCities.includes(cityNormalized)) {
        return res.status(400).json({ error: `"city" must be one of: ${allowedCities.join(', ')}` });
      }
      query.city = cityNormalized;
    }

    // Validate region
    if (region !== null) {
      const regionNormalized = String(region).trim().toLowerCase();
      if (!allowedRegions.includes(regionNormalized)) {
        return res.status(400).json({ error: `"region" must be one of: ${allowedRegions.join(', ')}` });
      }
      query.region = regionNormalized;
    }

    // Execute query
    let resultsQuery = db.find(query);

    // Validate and apply limit
    if (limit !== null) {
      if (!Number.isInteger(limit) || limit <= 0) {
        return res.status(400).json({ error: '"limit" must be a positive integer if provided' });
      }
      resultsQuery = resultsQuery.limit?.(limit) ?? resultsQuery.slice(0, limit);
    }

    const results = await resultsQuery.toArray?.() ?? resultsQuery; // note: must test

    res.status(200).json(results);

  } catch (err) {
    next(err);
  }
});



app.post('/userEvents', async (req, res, next) => {
  try {
    const { username, limit } = req.body;

    // Validate username
    if (!username || !username.toString().trim()) {
      return res.status(400).json({
        error: '"username" must be provided and non-empty'
      });
    }

    // Build the query
    let query = db.find({ users: username });

    // Apply limit only if provided
    if (limit !== undefined) {
      const parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return res.status(400).json({ error: '"limit" must be a positive number' });
      }
      query = query.limit(parsedLimit);
    }

    const results = await query;

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

app.post('/addUserToEvent', async (req, res) => {
  const { userName, eventId } = req.body;

  if (!userName || !eventId) {
    return res.status(400).json({ message: "userName and eventId are required" });
  }

  try {
    // Find the event by id
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.users.includes(userName)) {
      event.users.push(userName);
      await event.save(); // test that it works
      return res.status(200).json({ message: `${userName} added to the event`, event });
    } else {
      return res.status(200).json({ message: `${userName} is already in the event`, event });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});


///////////////////////////////////////////////////////


// no endpoint found
app.use(function (req, res) {
  res.status(404).json({error: 'Error 404', message: 'Sorry can\'t find that!'});
});

// Error thrown
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});


if(db.db){ 
  // bind it to as server to be able to use the .close() function
  const server = app.listen(PORT, () => {
    console.log(`Example app app listening at http://localhost:${PORT}`);
    console.log("Swagger docs available at http://localhost:3000/api-docs");
  });
  // in case it's a linux/unix/mac
  process.on('SIGINT', () => {
    console.log('SIGINT received (Ctrl+C). Shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });

  // if we are on a windows
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
} else {
  console.error('Failed to load STM data. Server not started.');
  // This is so that the program does not keep running if something goes wrong.
  process.exit(1);
}