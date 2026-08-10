import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get all ratings or ratings for specific item
router.get('/', (req, res) => {
  const { itemName } = req.query;
  const ratings = db.getRatings(itemName ? String(itemName) : undefined);
  return res.json(ratings);
});

// Get ratings for specific item by path
router.get('/item/:itemName', (req, res) => {
  const { itemName } = req.params;
  const ratings = db.getRatings(itemName);
  return res.json(ratings);
});

// Submit a new rating & review
router.post('/', (req, res) => {
  const { username, itemName, stars, comment, orderID } = req.body;
  if (!username || !itemName || !stars) {
    return res.status(400).json({ error: 'username, itemName, and stars (1-5) are required.' });
  }

  const numStars = Number(stars);
  if (isNaN(numStars) || numStars < 1 || numStars > 5) {
    return res.status(400).json({ error: 'Stars rating must be an integer between 1 and 5.' });
  }

  const newRating = db.addRating({
    username,
    itemName,
    stars: numStars,
    comment: comment || '',
    orderID: orderID || ''
  });

  const updatedMenu = db.getMenuItemsWithRatings();
  const updatedItem = updatedMenu.find(m => m.name.toLowerCase() === itemName.toLowerCase());

  return res.json({ success: true, rating: newRating, item: updatedItem });
});

export default router;
