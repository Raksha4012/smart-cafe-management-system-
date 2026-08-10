import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get all menu items
router.get('/', (req, res) => {
  const items = db.getMenuItems();
  return res.json(items);
});

// Add menu item (Admin)
router.post('/', (req, res) => {
  const { name, price, category, type, prepTime } = req.body;
  if (!name || !price || !category || !type || !prepTime) {
    return res.status(400).json({ error: 'All fields (name, price, category, type, prepTime) are required.' });
  }

  const existing = db.getMenuItems().find(m => m.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Item with this name already exists.' });
  }

  const newItem = { name, price: Number(price), category, type, prepTime: Number(prepTime) };
  db.addMenuItem(newItem);
  return res.json({ success: true, item: newItem });
});

// Update menu item (Admin)
router.put('/:name', (req, res) => {
  const { name } = req.params;
  const updated = db.updateMenuItem(name, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }
  return res.json({ success: true, item: updated });
});

export default router;
