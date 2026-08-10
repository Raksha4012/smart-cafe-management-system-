import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get kitchen queue
router.get('/', (req, res) => {
  const queue = db.getKitchenQueue();
  return res.json(queue);
});

// Mark item/order as prepared
router.put('/mark-prepared', (req, res) => {
  const { orderID } = req.body;
  if (!orderID) {
    return res.status(400).json({ error: 'orderID is required.' });
  }

  const { kitchenQueue, order } = db.markKitchenItemPrepared(orderID);
  return res.json({ success: true, kitchenQueue, order });
});

export default router;
