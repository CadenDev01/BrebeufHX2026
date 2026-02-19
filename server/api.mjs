import express from 'express';
import path from 'path';
import compression from 'compression';
import cors from 'cors';
import {db} from './db/DB.mjs';
import { ObjectId } from 'mongodb';
import process from 'node:process';
import authRoutes from './routes/auth.mjs';
import relationshipsRoutes from './routes/relationships.mjs';
import conversationsRoutes from './routes/conversations.mjs';
import messagesRoutes from './routes/messages.mjs';
import adminRoutes from './routes/admin.mjs';
import { authenticateToken } from './middleware/auth.mjs';

if(db.db === null) await db.connect();
await db.setCollection('sports');
const PORT = process.env.PORT || 3000;

const app = express();

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:80',
  'http://localhost',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all origins in production for now
  },
  credentials: true
}));

app.use(express.json());
app.use(express.json({ limit: '10kb' }));

app.use(compression());

app.use(express.static('./client/dist/'));

app.use('/api/auth', authRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);

// Serve static client files
app.use(express.static(path.join(process.cwd(), 'sportify-client/dist')));

// Health check endpoint for root
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'sportify-client/dist/index.html'));
});

// Catch-all for client-side routing - serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'sportify-client/dist/index.html'));
});

///////////////////////////////////////////////////////

// Example allowed lists
const allowedSports = ['soccer', 'basketball', 'tennis'];
const allowedSportTypes = ['indoor', 'outdoor'];
const allowedCities = ['montreal', 'laval', 'chicago'];
const allowedRegions = ['north', 'south', 'east', 'west'];

app.post('/api/search', async (req, res, next) => {
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

app.get('/api/userEvents', authenticateToken, async (req, res, next) => {
  try {
    await db.setCollection('sports');

    const user = req.user;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

    // Find events where user is in attendees array
    let cursor = db.collection.find({ 'attendees.odId': new ObjectId(user.id) });

    if (limit !== null && limit > 0) {
      cursor = cursor.limit(limit);
    }

    const results = await cursor.toArray();

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
});

app.post('/api/addUserToEvent', authenticateToken, async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "eventId is required" });
  }

  try {
    await db.setCollection('sports');

    // Get user info from the authenticated token
    const user = req.user;

    // Find the event by id
    let objectId;
    try {
      objectId = new ObjectId(eventId);
    } catch {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    const event = await db.collection.findOne({ _id: objectId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user already joined
    const attendees = event.attendees || [];
    const alreadyJoined = attendees.some(a => a.odId?.toString() === user.id?.toString());

    if (alreadyJoined) {
      return res.status(200).json({ message: "You have already joined this event", alreadyJoined: true });
    }

    // Add user to attendees
    const attendeeData = {
      odId: new ObjectId(user.id),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      joinedAt: new Date()
    };

    await db.collection.updateOne(
      { _id: objectId },
      { $push: { attendees: attendeeData } }
    );

    return res.status(200).json({
      message: "Successfully joined the event",
      attendee: attendeeData
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get('/api/event/:id/attendees', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await db.setCollection('sports');

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    const event = await db.collection.findOne({ _id: objectId });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Return attendees with only name (privacy: no email)
    const attendees = (event.attendees || []).map(a => ({
      odId: a.odId,
      firstName: a.firstName,
      lastName: a.lastName,
      joinedAt: a.joinedAt
    }));

    return res.status(200).json({ attendees, count: attendees.length });

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
  const server = app.listen(PORT,"0.0.0.0", () => {
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