import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken, requireRole } from '../middleware/auth.mjs';
import { db } from '../db/DB.mjs';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// Get dashboard stats overview
router.get('/stats', async (req, res) => {
  try {
    // User stats
    await db.setCollection('users');
    const totalUsers = await db.collection.countDocuments();
    const activeUsers = await db.collection.countDocuments({ isActive: true });

    // Users by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLast30Days = await db.collection.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // User signups by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const userSignupsByDay = await db.collection.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Event stats
    await db.setCollection('sports');
    const totalEvents = await db.collection.countDocuments();

    // Events with attendees
    const eventsWithAttendees = await db.collection.countDocuments({
      'attendees.0': { $exists: true }
    });

    // Total attendees across all events
    const attendeeStats = await db.collection.aggregate([
      { $project: { attendeeCount: { $size: { $ifNull: ['$attendees', []] } } } },
      { $group: { _id: null, total: { $sum: '$attendeeCount' } } }
    ]).toArray();
    const totalAttendees = attendeeStats[0]?.total || 0;

    // Popular sports
    const popularSports = await db.collection.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Popular cities
    const popularCities = await db.collection.aggregate([
      { $match: { city: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Message stats
    await db.setCollection('messages');
    const totalMessages = await db.collection.countDocuments();
    const messagesLast7Days = await db.collection.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Conversation stats
    await db.setCollection('conversations');
    const totalConversations = await db.collection.countDocuments();
    const dmCount = await db.collection.countDocuments({ type: 'dm' });
    const groupCount = await db.collection.countDocuments({ type: 'group' });
    const eventChatCount = await db.collection.countDocuments({ type: 'event' });

    // Relationship stats
    await db.setCollection('relationships');
    const totalFriendships = await db.collection.countDocuments({ type: 'friend', status: 'accepted' });
    const totalFollows = await db.collection.countDocuments({ type: 'follow' });
    const pendingRequests = await db.collection.countDocuments({ type: 'friend', status: 'pending' });

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        newLast30Days: newUsersLast30Days,
        signupsByDay: userSignupsByDay
      },
      events: {
        total: totalEvents,
        withAttendees: eventsWithAttendees,
        totalAttendees,
        popularSports,
        popularCities
      },
      messaging: {
        totalMessages,
        messagesLast7Days,
        conversations: {
          total: totalConversations,
          dm: dmCount,
          group: groupCount,
          event: eventChatCount
        }
      },
      social: {
        friendships: totalFriendships,
        follows: totalFollows,
        pendingRequests
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (paginated)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    await db.setCollection('users');

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const users = await db.collection
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (toggle active, change role)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, roles } = req.body;

    await db.setCollection('users');

    const updates = { updatedAt: new Date() };
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (Array.isArray(roles)) updates.roles = roles;

    const result = await db.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await db.collection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (id === req.user.id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.setCollection('users');
    const result = await db.collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clean up user's relationships
    await db.setCollection('relationships');
    await db.collection.deleteMany({
      $or: [
        { requester: new ObjectId(id) },
        { recipient: new ObjectId(id) }
      ]
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all events (paginated)
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    await db.setCollection('sports');

    const query = search
      ? {
          $or: [
            { sport: { $regex: search, $options: 'i' } },
            { city: { $regex: search, $options: 'i' } },
            { sport_location: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const events = await db.collection
      .find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection.countDocuments(query);

    // Add attendee count to each event
    const eventsWithCount = events.map(e => ({
      ...e,
      attendeeCount: e.attendees?.length || 0
    }));

    res.json({
      events: eventsWithCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get events error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent activity log
router.get('/activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get recent user signups
    await db.setCollection('users');
    const recentUsers = await db.collection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Get recent messages
    await db.setCollection('messages');
    const recentMessages = await db.collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    // Combine and sort by date
    const activity = [
      ...recentUsers.map(u => ({
        type: 'user_signup',
        data: { username: u.username, firstName: u.firstName, lastName: u.lastName },
        createdAt: u.createdAt
      })),
      ...recentMessages.map(m => ({
        type: 'message',
        data: { conversationId: m.conversationId },
        createdAt: m.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, parseInt(limit));

    res.json({ activity });
  } catch (error) {
    console.error('Admin activity error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
