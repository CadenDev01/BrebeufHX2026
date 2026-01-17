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
await db.setCollection('sports');
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
const allowedCities = ['montreal', 'laval', 'chicago'];
const allowedRegions = ['north', 'south', 'east', 'west'];

app.post('/api/search', authenticateToken, async (req, res, next) => {
  try {
    await db.setCollection('sports');

    const {
      sport,
      sportType,
      sportLocation,
      city,
      region = null,
      limit = null
    } = req.body;

    const query = {};

    if (sport !== undefined) {
      query.sport = String(sport).trim().toLowerCase();
    }

    if (sportType !== undefined) {
      query.sport_type = String(sportType).trim().toLowerCase();
    }

    if (sportLocation !== undefined) {
      query.sport_location = String(sportLocation).trim().toLowerCase();
    }

    if (city !== undefined) {
      query.city = String(city).trim().toLowerCase();
    }

    if (region !== null) {
      query.region = String(region).trim().toLowerCase();
    }

    console.log('Query:', query);

    let cursor = db.find(query);

    if (limit !== null) {
      if (!Number.isInteger(limit) || limit <= 0) {
        return res.status(400).json({ error: '"limit" must be a positive integer' });
      }
      cursor = cursor.limit(limit);
    }

    const results = await cursor.toArray();

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

app.get('/api/sports', async (req, res, next) => {
  try {
    await db.setCollection('sports');

    const sports = await db.collection.aggregate([
      { $group: { _id: "$sport" } } // Group by sport to get unique values
    ]).toArray();

    const distinctSports = sports.map(sport => sport._id); // Extract distinct sports

    res.status(200).json(distinctSports); // Return the distinct sports
  } catch (err) {
    console.error('Error fetching sports:', err);
    next(err);  // Pass the error to the global error handler
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