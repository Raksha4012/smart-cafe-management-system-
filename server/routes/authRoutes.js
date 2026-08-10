import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
  const { username, password, email, phoneNumber } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required.' });
  }

  const existingUser = db.getUser(username);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  const newUser = {
    username,
    password,
    email,
    phoneNumber: phoneNumber || '',
    walletBalance: 0,
    orderHistory: [],
    totalSpent: 0,
    notifications: []
  };

  db.saveUser(newUser);
  return res.json({ success: true, user: newUser });
});

// Login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.getUser(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  return res.json({ success: true, user });
});

// Add wallet balance
router.post('/wallet/add', (req, res) => {
  const { username, amount } = req.body;
  if (!username || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid username or amount.' });
  }

  const user = db.getUser(username);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.walletBalance = (user.walletBalance || 0) + amount;
  db.saveUser(user);

  return res.json({ success: true, user });
});

// Set wallet PIN
router.post('/wallet/pin', (req, res) => {
  const { username, pin } = req.body;
  if (!username || !pin || pin.length !== 4) {
    return res.status(400).json({ error: '4-digit PIN is required.' });
  }

  const user = db.getUser(username);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.walletPin = pin;
  db.saveUser(user);

  return res.json({ success: true, user });
});

// Mark notifications read
router.put('/notifications/read', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  const user = db.getUser(username);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.notifications = (user.notifications || []).map(n => ({ ...n, isRead: true }));
  db.saveUser(user);

  return res.json({ success: true, user });
});

export default router;
