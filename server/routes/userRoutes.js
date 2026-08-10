import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get all users (Admin view)
router.get('/', (req, res) => {
  const users = db.getUsers();
  return res.json(users);
});

export default router;
