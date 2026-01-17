import express from 'express';
import User from '../models/User.mjs';
import { generateToken, authenticateToken } from '../middleware/auth.mjs';
import { db } from '../db/DB.mjs';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, location } = req.body;

    const validation = User.validate({ username, email, password, firstName, lastName, location });
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    await db.setCollection('users');

    const existingUser = await db.collection.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const hashedPassword = await User.hashPassword(password);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      location,
      roles: ['user'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const result = await db.collection.insertOne(newUser);
    newUser._id = result.insertedId;

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser.toSafeJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    await db.setCollection('users');

    const userData = await db.collection.findOne({ email });

    if (!userData) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = new User(userData);

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await db.collection.updateOne(
      { _id: user._id },
      { $set: { updatedAt: new Date() } }
    );

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    await db.setCollection('users');

    const userData = await db.collection.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = new User(userData);

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    res.json({
      valid: true,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    await db.setCollection('users');

    const userData = await db.collection.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = new User(userData);

    res.json({ user: user.toSafeJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
});

export default router;
