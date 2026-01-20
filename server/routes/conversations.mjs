import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.mjs';
import { db } from '../db/DB.mjs';

const router = express.Router();

// Get user's conversations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.setCollection('conversations');

    const conversations = await db.collection.find({
      participants: new ObjectId(userId)
    }).sort({ updatedAt: -1 }).toArray();

    // Get participant details for each conversation
    const allParticipantIds = [...new Set(
      conversations.flatMap(c => c.participants.map(p => p.toString()))
    )];

    await db.setCollection('users');
    const users = await db.collection.find(
      { _id: { $in: allParticipantIds.map(id => new ObjectId(id)) } },
      { projection: { password: 0 } }
    ).toArray();

    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const conversationsWithDetails = conversations.map(conv => ({
      ...conv,
      participantDetails: conv.participants.map(p => userMap[p.toString()]).filter(Boolean)
    }));

    res.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or get existing DM conversation
router.post('/dm', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required' });
    }

    if (userId === recipientId) {
      return res.status(400).json({ error: 'Cannot create DM with yourself' });
    }

    await db.setCollection('conversations');

    // Check if DM already exists between these users
    const existing = await db.collection.findOne({
      type: 'dm',
      participants: {
        $all: [new ObjectId(userId), new ObjectId(recipientId)],
        $size: 2
      }
    });

    if (existing) {
      return res.json({ conversation: existing, existing: true });
    }

    // Create new DM
    const conversation = {
      type: 'dm',
      name: null,
      eventId: null,
      participants: [new ObjectId(userId), new ObjectId(recipientId)],
      lastMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection.insertOne(conversation);
    conversation._id = result.insertedId;

    res.status(201).json({ conversation, existing: false });
  } catch (error) {
    console.error('Create DM error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create group conversation
router.post('/group', authenticateToken, async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (!participantIds || participantIds.length < 1) {
      return res.status(400).json({ error: 'At least one other participant is required' });
    }

    await db.setCollection('conversations');

    // Include creator in participants
    const allParticipants = [
      new ObjectId(userId),
      ...participantIds.map(id => new ObjectId(id))
    ];

    const conversation = {
      type: 'group',
      name,
      eventId: null,
      participants: allParticipants,
      createdBy: new ObjectId(userId),
      lastMessage: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection.insertOne(conversation);
    conversation._id = result.insertedId;

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get conversation by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.setCollection('conversations');

    const conversation = await db.collection.findOne({
      _id: new ObjectId(id),
      participants: new ObjectId(userId)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get participant details
    await db.setCollection('users');
    const participants = await db.collection.find(
      { _id: { $in: conversation.participants } },
      { projection: { password: 0 } }
    ).toArray();

    res.json({ conversation: { ...conversation, participantDetails: participants } });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update group conversation (name, add/remove participants)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, addParticipants, removeParticipants } = req.body;
    const userId = req.user.id;

    await db.setCollection('conversations');

    const conversation = await db.collection.findOne({
      _id: new ObjectId(id),
      participants: new ObjectId(userId),
      type: 'group'
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Group conversation not found' });
    }

    const updates = { updatedAt: new Date() };

    if (name) {
      updates.name = name;
    }

    const arrayUpdates = {};

    if (addParticipants && addParticipants.length > 0) {
      arrayUpdates.$addToSet = {
        participants: { $each: addParticipants.map(id => new ObjectId(id)) }
      };
    }

    if (removeParticipants && removeParticipants.length > 0) {
      arrayUpdates.$pull = {
        participants: { $in: removeParticipants.map(id => new ObjectId(id)) }
      };
    }

    await db.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates, ...arrayUpdates }
    );

    const updated = await db.collection.findOne({ _id: new ObjectId(id) });

    res.json({ conversation: updated });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Leave group conversation
router.delete('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.setCollection('conversations');

    const conversation = await db.collection.findOne({
      _id: new ObjectId(id),
      participants: new ObjectId(userId),
      type: 'group'
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Group conversation not found' });
    }

    await db.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { participants: new ObjectId(userId) },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({ message: 'Left group conversation' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get or create event chat
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // First verify user is attendee of the event
    await db.setCollection('sports');
    const event = await db.collection.findOne({
      _id: new ObjectId(eventId),
      'attendees.odId': new ObjectId(userId)
    });

    if (!event) {
      return res.status(403).json({ error: 'You must be an attendee to access event chat' });
    }

    await db.setCollection('conversations');

    // Find or create event conversation
    let conversation = await db.collection.findOne({
      type: 'event',
      eventId: new ObjectId(eventId)
    });

    if (!conversation) {
      // Create event conversation with all current attendees
      const attendeeIds = event.attendees.map(a => a.odId);

      conversation = {
        type: 'event',
        name: event.name || `${event.sport} at ${event.facility_name}`,
        eventId: new ObjectId(eventId),
        participants: attendeeIds,
        lastMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection.insertOne(conversation);
      conversation._id = result.insertedId;
    } else {
      // Ensure current user is in participants
      if (!conversation.participants.some(p => p.toString() === userId)) {
        await db.collection.updateOne(
          { _id: conversation._id },
          { $addToSet: { participants: new ObjectId(userId) } }
        );
        conversation.participants.push(new ObjectId(userId));
      }
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Get event chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
