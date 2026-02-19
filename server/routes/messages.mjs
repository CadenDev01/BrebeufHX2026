import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.mjs';
import { db } from '../db/DB.mjs';

const router = express.Router();

// Get messages for a conversation (paginated)
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user.id;

    // Verify user is participant
    await db.setCollection('conversations');
    const conversation = await db.collection.findOne({
      _id: new ObjectId(conversationId),
      participants: new ObjectId(userId)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await db.setCollection('messages');

    const query = { conversationId: new ObjectId(conversationId) };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await db.collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    // Get sender details
    const senderIds = [...new Set(messages.map(m => m.senderId.toString()))];

    await db.setCollection('users');
    const senders = await db.collection.find(
      { _id: { $in: senderIds.map(id => new ObjectId(id)) } },
      { projection: { password: 0 } }
    ).toArray();

    const senderMap = {};
    senders.forEach(s => { senderMap[s._id.toString()] = s; });

    const messagesWithSenders = messages.map(msg => ({
      ...msg,
      sender: senderMap[msg.senderId.toString()]
    }));

    // Return in chronological order
    res.json({ messages: messagesWithSenders.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is participant
    await db.setCollection('conversations');
    const conversation = await db.collection.findOne({
      _id: new ObjectId(conversationId),
      participants: new ObjectId(userId)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await db.setCollection('messages');

    const message = {
      conversationId: new ObjectId(conversationId),
      senderId: new ObjectId(userId),
      content: content.trim(),
      readBy: [new ObjectId(userId)],
      createdAt: new Date()
    };

    const result = await db.collection.insertOne(message);
    message._id = result.insertedId;

    // Update conversation's lastMessage
    await db.setCollection('conversations');
    await db.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage: {
            content: content.trim().substring(0, 100),
            senderId: new ObjectId(userId),
            sentAt: message.createdAt
          },
          updatedAt: new Date()
        }
      }
    );

    // Add sender info to response
    message.sender = {
      _id: req.user.id,
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    };

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.put('/:conversationId/read', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is participant
    await db.setCollection('conversations');
    const conversation = await db.collection.findOne({
      _id: new ObjectId(conversationId),
      participants: new ObjectId(userId)
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await db.setCollection('messages');

    await db.collection.updateMany(
      {
        conversationId: new ObjectId(conversationId),
        readBy: { $ne: new ObjectId(userId) }
      },
      {
        $addToSet: { readBy: new ObjectId(userId) }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread message count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's conversations
    await db.setCollection('conversations');
    const conversations = await db.collection.find({
      participants: new ObjectId(userId)
    }).toArray();

    const conversationIds = conversations.map(c => c._id);

    // Count unread messages
    await db.setCollection('messages');
    const unreadCount = await db.collection.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: new ObjectId(userId) },
      readBy: { $ne: new ObjectId(userId) }
    });

    // Get unread counts per conversation
    const unreadByConversation = await db.collection.aggregate([
      {
        $match: {
          conversationId: { $in: conversationIds },
          senderId: { $ne: new ObjectId(userId) },
          readBy: { $ne: new ObjectId(userId) }
        }
      },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const unreadMap = {};
    unreadByConversation.forEach(u => {
      unreadMap[u._id.toString()] = u.count;
    });

    res.json({ totalUnread: unreadCount, unreadByConversation: unreadMap });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
