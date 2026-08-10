import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get all orders (Admin)
router.get('/', (req, res) => {
  const orders = db.getOrders();
  return res.json(orders);
});

// Get user orders
router.get('/user/:username', (req, res) => {
  const { username } = req.params;
  const userOrders = db.getOrders().filter(o => o.username === username);
  return res.json(userOrders);
});

// Create order
router.post('/', (req, res) => {
  const { username, items, paymentMethod, splitPeople, perPersonAmount } = req.body;

  if (!username || !items || !items.length) {
    return res.status(400).json({ error: 'Username and order items are required.' });
  }

  const user = db.getUser(username);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const discount = subtotal > 500 ? subtotal * 0.10 : 0;
  const finalAmount = subtotal + tax - discount;
  const prepTotal = items.reduce((sum, item) => sum + item.prepTime * item.quantity, 0);
  const orderID = `CAF${Math.floor(Math.random() * 90000) + 10000}`;

  const walletDeduction = paymentMethod === 'Wallet' ? (perPersonAmount || finalAmount) : 0;

  if (paymentMethod === 'Wallet' && user.walletBalance < walletDeduction) {
    return res.status(400).json({ error: 'Insufficient wallet balance.' });
  }

  const newOrder = {
    orderID,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    items: [...items],
    subtotal,
    tax,
    discount,
    finalAmount,
    paymentMethod,
    orderDate: new Date().toLocaleDateString(),
    orderTime: new Date().toLocaleTimeString(),
    isCompleted: false,
    estimatedPrepTime: prepTotal,
    splitPeople: splitPeople > 1 ? splitPeople : undefined,
    perPersonAmount: splitPeople > 1 ? perPersonAmount : undefined
  };

  const notification = {
    orderID,
    username: user.username,
    message: `Your order #${orderID} has been received! Estimated prep time: ~${prepTotal} minutes.`,
    timestamp: new Date().toLocaleTimeString(),
    isRead: false
  };

  // Update user state
  user.orderHistory.push(orderID);
  user.totalSpent += finalAmount;
  user.walletBalance -= walletDeduction;
  user.notifications.push(notification);
  db.saveUser(user);

  // Add order to DB
  db.addOrder(newOrder);

  // Add kitchen prep items
  const kitchenItems = items.map(item => ({
    itemName: item.itemName,
    quantity: item.quantity,
    comment: item.comment || '',
    prepTime: item.prepTime,
    orderID,
    orderDate: newOrder.orderDate,
    orderTime: newOrder.orderTime,
    isPrepared: false,
    priority: 3
  }));
  db.addKitchenPrepItems(kitchenItems);

  // Update trending dishes and financials
  db.incrementTrendingDishes(items);
  db.addFinancials(finalAmount, finalAmount * 0.4);

  return res.json({ success: true, order: newOrder, user });
});

export default router;
