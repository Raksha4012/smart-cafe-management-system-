import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get financial & operational analytics
router.get('/', (req, res) => {
  const analytics = db.getAnalytics();
  return res.json(analytics);
});

export default router;
