export interface MenuItem {
  name: string;
  price: number;
  category: string;
  type: 'Veg' | 'NonVeg' | 'Vegan' | 'ALL-TYPE';
  prepTime: number;
  avgRating?: number;
  reviewCount?: number;
}

export interface RatingRecord {
  ratingID: string;
  username: string;
  itemName: string;
  orderID?: string;
  stars: number;
  comment: string;
  timestamp: string;
}

export interface OrderItem {
  itemName: string;
  price: number;
  quantity: number;
  comment: string;
  prepTime: number;
}

export interface OrderRecord {
  orderID: string;
  username: string;
  email: string;
  phoneNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  finalAmount: number;
  paymentMethod: string;
  orderDate: string;
  orderTime: string;
  isCompleted: boolean;
  estimatedPrepTime: number;
  splitPeople?: number;
  perPersonAmount?: number;
}

export interface User {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  walletBalance: number;
  orderHistory: string[];
  totalSpent: number;
  notifications: Notification[];
  walletPin?: string;
}

export interface Notification {
  orderID: string;
  username: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface KitchenPrepItem {
  itemName: string;
  quantity: number;
  comment: string;
  prepTime: number;
  orderID: string;
  orderDate: string;
  orderTime: string;
  isPrepared: boolean;
  priority: number;
}
