import express from 'express';
import { ObjectId } from 'mongodb';
import { authenticateToken } from '../middleware/auth.mjs';
import { db } from '../db/DB.mjs';

const router = express.Router();

// Send friend request
router.post('/friend/request', authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user.id;

    if (!recipientId) {
      return res.status(400).json({ error: 'recipientId is required' });
    }

    if (requesterId === recipientId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    await db.setCollection('relationships');

    // Check if relationship already exists
    const existing = await db.collection.findOne({
      $or: [
        { requester: new ObjectId(requesterId), recipient: new ObjectId(recipientId), type: 'friend' },
        { requester: new ObjectId(recipientId), recipient: new ObjectId(requesterId), type: 'friend' }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Friend request already pending' });
      }
    }

    const relationship = {
      type: 'friend',
      requester: new ObjectId(requesterId),
      recipient: new ObjectId(recipientId),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection.insertOne(relationship);

    res.status(201).json({ message: 'Friend request sent', relationship });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Respond to friend request (accept/decline)
router.post('/friend/respond', authenticateToken, async (req, res) => {
  try {
    const { requesterId, accept } = req.body;
    const recipientId = req.user.id;

    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' });
    }

    await db.setCollection('relationships');

    const relationship = await db.collection.findOne({
      requester: new ObjectId(requesterId),
      recipient: new ObjectId(recipientId),
      type: 'friend',
      status: 'pending'
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    const newStatus = accept ? 'accepted' : 'declined';

    await db.collection.updateOne(
      { _id: relationship._id },
      { $set: { status: newStatus, updatedAt: new Date() } }
    );

    res.json({ message: `Friend request ${newStatus}`, status: newStatus });
  } catch (error) {
    console.error('Friend respond error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove friend
router.delete('/friend/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await db.setCollection('relationships');

    const result = await db.collection.deleteOne({
      $or: [
        { requester: new ObjectId(currentUserId), recipient: new ObjectId(userId), type: 'friend', status: 'accepted' },
        { requester: new ObjectId(userId), recipient: new ObjectId(currentUserId), type: 'friend', status: 'accepted' }
      ]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Follow a user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    if (followerId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    await db.setCollection('relationships');

    // Check if already following
    const existing = await db.collection.findOne({
      requester: new ObjectId(followerId),
      recipient: new ObjectId(userId),
      type: 'follow'
    });

    if (existing) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    const relationship = {
      type: 'follow',
      requester: new ObjectId(followerId),
      recipient: new ObjectId(userId),
      status: 'accepted',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection.insertOne(relationship);

    res.status(201).json({ message: 'Now following user', relationship });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unfollow a user
router.delete('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    await db.setCollection('relationships');

    const result = await db.collection.deleteOne({
      requester: new ObjectId(followerId),
      recipient: new ObjectId(userId),
      type: 'follow'
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    res.json({ message: 'Unfollowed user' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get friends list
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.setCollection('relationships');

    const relationships = await db.collection.find({
      $or: [
        { requester: new ObjectId(userId), type: 'friend', status: 'accepted' },
        { recipient: new ObjectId(userId), type: 'friend', status: 'accepted' }
      ]
    }).toArray();

    // Get friend user IDs
    const friendIds = relationships.map(r =>
      r.requester.toString() === userId ? r.recipient : r.requester
    );

    // Get friend details
    await db.setCollection('users');
    const friends = await db.collection.find(
      { _id: { $in: friendIds } },
      { projection: { password: 0 } }
    ).toArray();

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get followers
router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.setCollection('relationships');

    const relationships = await db.collection.find({
      recipient: new ObjectId(userId),
      type: 'follow',
      status: 'accepted'
    }).toArray();

    const followerIds = relationships.map(r => r.requester);

    await db.setCollection('users');
    const followers = await db.collection.find(
      { _id: { $in: followerIds } },
      { projection: { password: 0 } }
    ).toArray();

    res.json({ followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get following (users the current user follows)
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.setCollection('relationships');

    const relationships = await db.collection.find({
      requester: new ObjectId(userId),
      type: 'follow',
      status: 'accepted'
    }).toArray();

    const followingIds = relationships.map(r => r.recipient);

    await db.setCollection('users');
    const following = await db.collection.find(
      { _id: { $in: followingIds } },
      { projection: { password: 0 } }
    ).toArray();

    res.json({ following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending friend requests (incoming)
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.setCollection('relationships');

    const requests = await db.collection.find({
      recipient: new ObjectId(userId),
      type: 'friend',
      status: 'pending'
    }).toArray();

    const requesterIds = requests.map(r => r.requester);

    await db.setCollection('users');
    const requesters = await db.collection.find(
      { _id: { $in: requesterIds } },
      { projection: { password: 0 } }
    ).toArray();

    // Combine request info with user info
    const requestsWithUsers = requests.map(req => ({
      ...req,
      requesterInfo: requesters.find(u => u._id.toString() === req.requester.toString())
    }));

    res.json({ requests: requestsWithUsers });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get relationship status with a specific user
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await db.setCollection('relationships');

    const friendRelation = await db.collection.findOne({
      $or: [
        { requester: new ObjectId(currentUserId), recipient: new ObjectId(userId), type: 'friend' },
        { requester: new ObjectId(userId), recipient: new ObjectId(currentUserId), type: 'friend' }
      ]
    });

    const followRelation = await db.collection.findOne({
      requester: new ObjectId(currentUserId),
      recipient: new ObjectId(userId),
      type: 'follow'
    });

    const isFollowedBy = await db.collection.findOne({
      requester: new ObjectId(userId),
      recipient: new ObjectId(currentUserId),
      type: 'follow'
    });

    res.json({
      isFriend: friendRelation?.status === 'accepted',
      friendRequestPending: friendRelation?.status === 'pending',
      friendRequestSentByMe: friendRelation?.requester.toString() === currentUserId && friendRelation?.status === 'pending',
      isFollowing: !!followRelation,
      isFollowedBy: !!isFollowedBy
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user.id;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    await db.setCollection('users');

    const users = await db.collection.find({
      _id: { $ne: new ObjectId(currentUserId) },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    }, { projection: { password: 0 } }).limit(20).toArray();

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
