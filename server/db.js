import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsonToCsv } from './csvHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'data', 'db.json');
const DATA_DIR = path.join(__dirname, 'data');

const initialData = {
  users: {
    Raksha: {
      username: 'Raksha',
      password: 'pass123',
      email: 'raksha@gmail.com',
      phoneNumber: '9876543210',
      walletBalance: 500,
      orderHistory: ['CAF1001'],
      totalSpent: 472.5,
      notifications: [],
      walletPin: '1234'
    },
    Priya: {
      username: 'Priya',
      password: 'pass123',
      email: 'priya@gmail.com',
      phoneNumber: '9876543211',
      walletBalance: 300,
      orderHistory: ['CAF1002'],
      totalSpent: 438.9,
      notifications: [
        {
          orderID: 'CAF1002',
          username: 'Priya',
          message: 'Your order #CAF1002 has been received! Estimated prep time: 35 minutes.',
          timestamp: new Date().toLocaleTimeString(),
          isRead: false
        }
      ],
      walletPin: '1234'
    }
  },
  menuItems: [
    { name: "Paneer Tikka", price: 180, category: "Starter", type: "Veg", prepTime: 15 },
    { name: "Chicken 65", price: 190, category: "Starter", type: "NonVeg", prepTime: 20 },
    { name: "Honey Chilli Potato", price: 150, category: "Starter", type: "Vegan", prepTime: 12 },
    { name: "Spring Rolls", price: 140, category: "Starter", type: "Vegan", prepTime: 10 },
    { name: "Tomato Soup", price: 100, category: "Soup", type: "Vegan", prepTime: 8 },
    { name: "Sweet Corn Soup", price: 110, category: "Soup", type: "Veg", prepTime: 8 },
    { name: "Veg Pizza", price: 220, category: "Pizza", type: "Veg", prepTime: 25 },
    { name: "Chicken Pizza", price: 280, category: "Pizza", type: "NonVeg", prepTime: 30 },
    { name: "Rajma Chawal", price: 140, category: "Main", type: "Vegan", prepTime: 20 },
    { name: "Butter Chicken", price: 240, category: "Main", type: "NonVeg", prepTime: 25 },
    { name: "Veg Noodles", price: 160, category: "Main", type: "Vegan", prepTime: 15 },
    { name: "Pav Bhaji", price: 120, category: "Main", type: "Veg", prepTime: 12 },
    { name: "Masala Chai", price: 40, category: "Drink", type: "Veg", prepTime: 5 },
    { name: "Cold Coffee", price: 90, category: "Drink", type: "Veg", prepTime: 5 },
    { name: "Virgin Mojito", price: 99, category: "Drink", type: "Vegan", prepTime: 5 },
    { name: "French Fries", price: 120, category: "Snack", type: "Vegan", prepTime: 10 },
    { name: "Veg Sandwich", price: 90, category: "Snack", type: "Veg", prepTime: 8 },
    { name: "Chicken Roll", price: 170, category: "Snack", type: "NonVeg", prepTime: 12 },
    { name: "Gulab Jamun", price: 50, category: "Dessert", type: "Veg", prepTime: 5 },
    { name: "Brownie Icecream", price: 120, category: "Dessert", type: "Veg", prepTime: 7 }
  ],
  orders: [
    {
      orderID: 'CAF1001',
      username: 'Raksha',
      email: 'raksha@gmail.com',
      phoneNumber: '9876543210',
      items: [
        { itemName: 'Paneer Tikka', price: 180, quantity: 2, comment: '', prepTime: 15 },
        { itemName: 'Cold Coffee', price: 90, quantity: 1, comment: 'Extra ice', prepTime: 5 }
      ],
      subtotal: 450,
      tax: 22.5,
      discount: 0,
      finalAmount: 472.5,
      paymentMethod: 'UPI',
      orderDate: new Date().toLocaleDateString(),
      orderTime: new Date().toLocaleTimeString(),
      estimatedPrepTime: 35,
      isCompleted: true
    },
    {
      orderID: 'CAF1002',
      username: 'Priya',
      email: 'priya@gmail.com',
      phoneNumber: '9876543211',
      items: [
        { itemName: 'Veg Pizza', price: 220, quantity: 1, comment: 'No olives', prepTime: 25 },
        { itemName: 'Virgin Mojito', price: 99, quantity: 2, comment: '', prepTime: 5 }
      ],
      subtotal: 418,
      tax: 20.9,
      discount: 0,
      finalAmount: 438.9,
      paymentMethod: 'Card',
      orderDate: new Date().toLocaleDateString(),
      orderTime: new Date().toLocaleTimeString(),
      estimatedPrepTime: 35,
      isCompleted: false
    }
  ],
  kitchenQueue: [
    {
      itemName: 'Veg Pizza',
      quantity: 1,
      comment: 'No olives',
      prepTime: 25,
      orderID: 'CAF1002',
      orderDate: new Date().toLocaleDateString(),
      orderTime: new Date().toLocaleTimeString(),
      isPrepared: false,
      priority: 2
    },
    {
      itemName: 'Virgin Mojito',
      quantity: 2,
      comment: '',
      prepTime: 5,
      orderID: 'CAF1002',
      orderDate: new Date().toLocaleDateString(),
      orderTime: new Date().toLocaleTimeString(),
      isPrepared: false,
      priority: 2
    }
  ],
  trendingDishes: {
    'Paneer Tikka': 2,
    'Cold Coffee': 1,
    'Veg Pizza': 1,
    'Virgin Mojito': 2
  },
  ratings: [
    {
      ratingID: 'RAT1001',
      username: 'Raksha',
      itemName: 'Paneer Tikka',
      orderID: 'CAF1001',
      stars: 5,
      comment: 'Deliciously spiced and fresh paneer!',
      timestamp: '10/8/2026, 4:15:00 PM'
    },
    {
      ratingID: 'RAT1002',
      username: 'Priya',
      itemName: 'Cold Coffee',
      orderID: 'CAF1001',
      stars: 4,
      comment: 'Very refreshing drink, perfect sweetness.',
      timestamp: '10/8/2026, 4:30:00 PM'
    },
    {
      ratingID: 'RAT1003',
      username: 'Raksha',
      itemName: 'Veg Pizza',
      orderID: 'CAF1002',
      stars: 5,
      comment: 'Crust was crispy and cheese was so rich!',
      timestamp: '10/8/2026, 5:00:00 PM'
    }
  ],
  totalRevenue: 911.4,
  totalProfit: 400
};

class Database {
  constructor() {
    this.data = initialData;
    this.init();
  }

  init() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...initialData, ...JSON.parse(raw) };
        this.save();
      } catch (err) {
        console.error('Error reading db file, re-initializing with seed data:', err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Save main JSON
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');

      // Save CSV files
      const userList = Object.values(this.data.users || {}).map(u => ({
        username: u.username,
        email: u.email,
        phoneNumber: u.phoneNumber,
        walletBalance: u.walletBalance,
        totalSpent: u.totalSpent,
        walletPin: u.walletPin || ''
      }));
      fs.writeFileSync(path.join(DATA_DIR, 'users.csv'), jsonToCsv(userList), 'utf-8');

      const menuList = (this.data.menuItems || []).map(m => ({
        name: m.name,
        price: m.price,
        category: m.category,
        type: m.type,
        prepTime: m.prepTime
      }));
      fs.writeFileSync(path.join(DATA_DIR, 'menu.csv'), jsonToCsv(menuList), 'utf-8');

      const orderList = (this.data.orders || []).map(o => ({
        orderID: o.orderID,
        username: o.username,
        email: o.email,
        phoneNumber: o.phoneNumber,
        itemsCount: o.items ? o.items.length : 0,
        subtotal: o.subtotal,
        tax: o.tax,
        discount: o.discount,
        finalAmount: o.finalAmount,
        paymentMethod: o.paymentMethod,
        orderDate: o.orderDate,
        orderTime: o.orderTime,
        isCompleted: o.isCompleted
      }));
      fs.writeFileSync(path.join(DATA_DIR, 'orders.csv'), jsonToCsv(orderList), 'utf-8');

      const ratingList = (this.data.ratings || []).map(r => ({
        ratingID: r.ratingID,
        username: r.username,
        itemName: r.itemName,
        orderID: r.orderID || '',
        stars: r.stars,
        comment: r.comment || '',
        timestamp: r.timestamp
      }));
      fs.writeFileSync(path.join(DATA_DIR, 'ratings.csv'), jsonToCsv(ratingList), 'utf-8');

      const kitchenList = (this.data.kitchenQueue || []).map(k => ({
        orderID: k.orderID,
        itemName: k.itemName,
        quantity: k.quantity,
        comment: k.comment || '',
        prepTime: k.prepTime,
        isPrepared: k.isPrepared,
        orderDate: k.orderDate,
        orderTime: k.orderTime
      }));
      fs.writeFileSync(path.join(DATA_DIR, 'kitchen.csv'), jsonToCsv(kitchenList), 'utf-8');

    } catch (err) {
      console.error('Error saving db file or CSV files:', err);
    }
  }

  getUsers() {
    return this.data.users;
  }

  getUser(username) {
    return this.data.users[username] || null;
  }

  saveUser(user) {
    this.data.users[user.username] = user;
    this.save();
    return user;
  }

  getMenuItems() {
    return this.getMenuItemsWithRatings();
  }

  getMenuItemsWithRatings() {
    const ratings = this.data.ratings || [];
    return this.data.menuItems.map(item => {
      const itemRatings = ratings.filter(r => r.itemName.toLowerCase() === item.name.toLowerCase());
      const reviewCount = itemRatings.length;
      const avgRating = reviewCount > 0
        ? Number((itemRatings.reduce((sum, r) => sum + r.stars, 0) / reviewCount).toFixed(1))
        : 4.5; // default rating for items without reviews
      return {
        ...item,
        avgRating,
        reviewCount
      };
    });
  }

  getRatings(itemName) {
    if (itemName) {
      return (this.data.ratings || []).filter(r => r.itemName.toLowerCase() === itemName.toLowerCase());
    }
    return this.data.ratings || [];
  }

  addRating(rating) {
    if (!this.data.ratings) this.data.ratings = [];
    const ratingID = `RAT${Math.floor(Math.random() * 90000) + 10000}`;
    const newRating = {
      ratingID,
      username: rating.username,
      itemName: rating.itemName,
      orderID: rating.orderID || '',
      stars: Number(rating.stars),
      comment: rating.comment || '',
      timestamp: new Date().toLocaleString()
    };
    this.data.ratings.push(newRating);
    this.save();
    return newRating;
  }

  addMenuItem(item) {
    this.data.menuItems.push(item);
    this.save();
    return item;
  }

  updateMenuItem(name, updatedItem) {
    const idx = this.data.menuItems.findIndex(m => m.name === name);
    if (idx !== -1) {
      this.data.menuItems[idx] = { ...this.data.menuItems[idx], ...updatedItem };
      this.save();
      return this.data.menuItems[idx];
    }
    return null;
  }

  getOrders() {
    return this.data.orders;
  }

  addOrder(order) {
    this.data.orders.push(order);
    this.save();
    return order;
  }

  updateOrder(orderID, updateObj) {
    const order = this.data.orders.find(o => o.orderID === orderID);
    if (order) {
      Object.assign(order, updateObj);
      this.save();
    }
    return order;
  }

  getKitchenQueue() {
    return this.data.kitchenQueue;
  }

  addKitchenPrepItems(items) {
    this.data.kitchenQueue.push(...items);
    this.save();
    return this.data.kitchenQueue;
  }

  markKitchenItemPrepared(orderID) {
    this.data.kitchenQueue = this.data.kitchenQueue.map(item =>
      item.orderID === orderID ? { ...item, isPrepared: true } : item
    );

    // Also mark order as completed if all items prepared
    const order = this.data.orders.find(o => o.orderID === orderID);
    if (order && !order.isCompleted) {
      order.isCompleted = true;

      // Add notification for user
      const user = this.data.users[order.username];
      if (user) {
        user.notifications.push({
          orderID,
          username: order.username,
          message: `Your order #${orderID} has been completed successfully! Please collect your order.`,
          timestamp: new Date().toLocaleTimeString(),
          isRead: false
        });
      }
    }

    this.save();
    return { kitchenQueue: this.data.kitchenQueue, order };
  }

  getTrendingDishes() {
    return this.data.trendingDishes;
  }

  incrementTrendingDishes(items) {
    items.forEach(item => {
      this.data.trendingDishes[item.itemName] = (this.data.trendingDishes[item.itemName] || 0) + item.quantity;
    });
    this.save();
  }

  addFinancials(revenue, profit) {
    this.data.totalRevenue += revenue;
    this.data.totalProfit += profit;
    this.save();
  }

  getAnalytics() {
    return {
      totalRevenue: this.data.totalRevenue,
      totalProfit: this.data.totalProfit,
      trendingDishes: this.data.trendingDishes,
      totalUsers: Object.keys(this.data.users).length,
      totalOrders: this.data.orders.length,
      activeOrders: this.data.orders.filter(o => !o.isCompleted).length
    };
  }
}

export const db = new Database();
