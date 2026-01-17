import express from 'express';
import path from 'path';
import compression from 'compression';
import cors from 'cors';
import {db} from './db/DB.mjs';
import { ObjectId } from 'mongodb';
import process from 'node:process';
import authRoutes from './routes/auth.mjs';
import { authenticateToken } from './middleware/auth.mjs';

if(db.db === null) await db.connect();
const PORT = process.env.PORT || 3000;

const app = express();

// Enable CORS for development
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.json({ limit: '10kb' }));

app.use(compression());

app.use(express.static('./client/dist/'));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./client/dist/index.html'));
});

///////////////////////////////////////////////////////

// Example allowed lists
const allowedSports = ['soccer', 'basketball', 'tennis'];
const allowedSportTypes = ['indoor', 'outdoor'];
const allowedCities = ['new york', 'los angeles', 'chicago'];
const allowedRegions = ['north', 'south', 'east', 'west'];

app.post('/search', authenticateToken, async (req, res, next) => {
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



app.post('/userEvents', authenticateToken, async (req, res, next) => {
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

app.post('/addUserToEvent', authenticateToken, async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id; // Get user ID from authenticated token

  if (!eventId) {
    return res.status(400).json({ message: "eventId is required" });
  }

  try {
    await db.setCollection('ProjectCollection');

    // Convert eventId to ObjectId
    let eventObjectId;
    try {
      eventObjectId = new ObjectId(eventId);
    } catch {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    // Find the event
    const event = await db.collection.findOne({ _id: eventObjectId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user is already an attendee
    const attendees = event.attendees || [];
    if (attendees.includes(userId)) {
      return res.status(200).json({ message: "You are already attending this event", event });
    }

    // Add user to attendees array
    const result = await db.collection.updateOne(
      { _id: eventObjectId },
      { $addToSet: { attendees: userId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to add user to event" });
    }

    const updatedEvent = await db.collection.findOne({ _id: eventObjectId });
    return res.status(200).json({ message: "Successfully added to event", event: updatedEvent });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post('/removeUserFromEvent', authenticateToken, async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.id;

  if (!eventId) {
    return res.status(400).json({ message: "eventId is required" });
  }

  try {
    await db.setCollection('ProjectCollection');

    let eventObjectId;
    try {
      eventObjectId = new ObjectId(eventId);
    } catch {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    const event = await db.collection.findOne({ _id: eventObjectId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const result = await db.collection.updateOne(
      { _id: eventObjectId },
      { $pull: { attendees: userId } }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "You were not attending this event" });
    }

    const updatedEvent = await db.collection.findOne({ _id: eventObjectId });
    return res.status(200).json({ message: "Successfully removed from event", event: updatedEvent });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get('/eventAttendees/:eventId', authenticateToken, async (req, res) => {
  const { eventId } = req.params;

  try {
    await db.setCollection('ProjectCollection');

    let eventObjectId;
    try {
      eventObjectId = new ObjectId(eventId);
    } catch {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    const event = await db.collection.findOne({ _id: eventObjectId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ attendees: event.attendees || [] });

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