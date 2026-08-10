import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, OrderRecord, OrderItem, KitchenPrepItem, Notification, MenuItem, RatingRecord } from '../types';
import { menuItems as defaultMenuItems } from '../data/menuData';
import { apiService } from '../services/api';

export type FoodPreference = 'Veg' | 'NonVeg' | 'Vegan' | 'AllTypes' | null;

interface CafeContextType {
  currentUser: User | null;
  users: Record<string, User>;
  orders: OrderRecord[];
  cart: OrderItem[];
  kitchenQueue: KitchenPrepItem[];
  menuItems: MenuItem[];
  ratings: RatingRecord[];
  trendingDishes: Record<string, number>;
  totalRevenue: number;
  totalProfit: number;
  foodPreference: FoodPreference;
  isBackendConnected: boolean;

  registerUser: (username: string, password: string, email: string, phone: string) => Promise<boolean>;
  loginUser: (username: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  setFoodPreference: (pref: FoodPreference) => void;
  setWalletPin: (pin: string) => void;

  addToCart: (itemName: string, quantity: number, comment: string) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  updateCartComment: (index: number, comment: string) => void;
  clearCart: () => void;

  createOrder: (paymentMethod: string, splitPeople: number, perPersonAmount: number) => Promise<OrderRecord | null>;
  markItemPrepared: (orderID: string) => Promise<void>;
  addWalletBalance: (amount: number) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  submitRating: (itemName: string, stars: number, comment?: string, orderID?: string) => Promise<boolean>;
  refreshBackendData: () => Promise<void>;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export function CafeProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [kitchenQueue, setKitchenQueue] = useState<KitchenPrepItem[]>([]);
  const [menuItemsState, setMenuItemsState] = useState<MenuItem[]>(defaultMenuItems);
  const [ratingsState, setRatingsState] = useState<RatingRecord[]>([]);
  const [trendingDishes, setTrendingDishes] = useState<Record<string, number>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [foodPreference, setFoodPreferenceState] = useState<FoodPreference>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const fetchBackendData = async () => {
    try {
      const [fetchedUsers, fetchedOrders, fetchedKitchen, fetchedAnalytics, fetchedMenu, fetchedRatings] = await Promise.all([
        apiService.getUsers(),
        apiService.getOrders(),
        apiService.getKitchenQueue(),
        apiService.getAnalytics(),
        apiService.getMenu(),
        apiService.getRatings()
      ]);

      setUsers(fetchedUsers);
      setOrders(fetchedOrders);
      setKitchenQueue(fetchedKitchen);
      setMenuItemsState(fetchedMenu);
      setRatingsState(fetchedRatings);
      setTrendingDishes(fetchedAnalytics.trendingDishes || {});
      setTotalRevenue(fetchedAnalytics.totalRevenue || 0);
      setTotalProfit(fetchedAnalytics.totalProfit || 0);
      setIsBackendConnected(true);

      // If current user is logged in, refresh current user state from fetched users
      if (currentUser && fetchedUsers[currentUser.username]) {
        setCurrentUser(fetchedUsers[currentUser.username]);
      }
    } catch (err) {
      console.warn('Backend API not reachable yet, operating in fallback sync mode.', err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    // Initial fetch from server database
    fetchBackendData();

    // Poll backend every 5 seconds to keep multi-user / kitchen sync smooth
    const interval = setInterval(fetchBackendData, 5000);
    return () => clearInterval(interval);
  }, []);

  const registerUser = async (username: string, password: string, email: string, phone: string): Promise<boolean> => {
    try {
      const res = await apiService.register({ username, password, email, phoneNumber: phone });
      if (res.success) {
        setUsers(prev => ({ ...prev, [username]: res.user }));
        return true;
      }
    } catch (err) {
      console.error('Registration API error:', err);
    }

    // Local fallback if server isn't running
    if (users[username]) return false;
    const newUser: User = {
      username, password, email, phoneNumber: phone,
      walletBalance: 0, orderHistory: [], totalSpent: 0, notifications: []
    };
    setUsers(prev => ({ ...prev, [username]: newUser }));
    return true;
  };

  const loginUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await apiService.login({ username, password });
      if (res.success) {
        setCurrentUser({ ...res.user });
        setFoodPreferenceState(null);
        return true;
      }
    } catch (err) {
      console.error('Login API error:', err);
    }

    // Fallback login check against current state
    const user = users[username];
    if (!user || user.password !== password) return false;
    setCurrentUser({ ...user });
    setFoodPreferenceState(null);
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setCart([]);
    setFoodPreferenceState(null);
  };

  const setFoodPreference = (pref: FoodPreference) => setFoodPreferenceState(pref);

  const setWalletPin = async (pin: string) => {
    if (!currentUser) return;
    try {
      const res = await apiService.setWalletPin(currentUser.username, pin);
      if (res.success) {
        setUsers(prev => ({ ...prev, [currentUser.username]: res.user }));
        setCurrentUser(res.user);
        return;
      }
    } catch (err) {
      console.error('Set wallet PIN error:', err);
    }

    setUsers(prev => ({
      ...prev,
      [currentUser.username]: { ...prev[currentUser.username], walletPin: pin }
    }));
    setCurrentUser(prev => prev ? { ...prev, walletPin: pin } : null);
  };

  const addToCart = (itemName: string, quantity: number, comment: string) => {
    const menuItem = menuItemsState.find(m => m.name === itemName) || defaultMenuItems.find(m => m.name === itemName);
    if (!menuItem) return;
    const orderItem: OrderItem = {
      itemName, price: menuItem.price, quantity, comment, prepTime: menuItem.prepTime
    };
    setCart(prev => [...prev, orderItem]);
    setTrendingDishes(prev => ({ ...prev, [itemName]: (prev[itemName] || 0) + quantity }));
  };

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

  const updateCartQuantity = (index: number, quantity: number) =>
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity } : item));

  const updateCartComment = (index: number, comment: string) =>
    setCart(prev => prev.map((item, i) => i === index ? { ...item, comment } : item));

  const clearCart = () => setCart([]);

  const createOrder = async (paymentMethod: string, splitPeople: number, perPersonAmount: number): Promise<OrderRecord | null> => {
    if (!currentUser || cart.length === 0) return null;

    try {
      const res = await apiService.createOrder({
        username: currentUser.username,
        items: cart,
        paymentMethod,
        splitPeople,
        perPersonAmount
      });

      if (res.success) {
        setOrders(prev => [...prev, res.order]);
        setUsers(prev => ({ ...prev, [currentUser.username]: res.user }));
        setCurrentUser(res.user);
        setCart([]);
        await fetchBackendData();
        return res.order;
      }
    } catch (err) {
      console.error('Create order API error:', err);
    }

    // In-memory fallback
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05;
    const discount = subtotal > 500 ? subtotal * 0.10 : 0;
    const finalAmount = subtotal + tax - discount;
    const prepTotal = cart.reduce((sum, item) => sum + item.prepTime * item.quantity, 0);
    const orderID = `CAF${Math.floor(Math.random() * 90000) + 10000}`;
    const walletDeduction = paymentMethod === 'Wallet' ? perPersonAmount : 0;

    const newOrder: OrderRecord = {
      orderID,
      username: currentUser.username, email: currentUser.email, phoneNumber: currentUser.phoneNumber,
      items: [...cart], subtotal, tax, discount, finalAmount, paymentMethod,
      orderDate: new Date().toLocaleDateString(), orderTime: new Date().toLocaleTimeString(),
      isCompleted: false, estimatedPrepTime: prepTotal,
      splitPeople: splitPeople > 1 ? splitPeople : undefined,
      perPersonAmount: splitPeople > 1 ? perPersonAmount : undefined
    };

    const notification: Notification = {
      orderID, username: currentUser.username,
      message: `Your order #${orderID} has been received! Estimated prep time: ~${prepTotal} minutes.`,
      timestamp: new Date().toLocaleTimeString(), isRead: false
    };

    setOrders(prev => [...prev, newOrder]);
    setUsers(prev => ({
      ...prev,
      [currentUser.username]: {
        ...prev[currentUser.username],
        orderHistory: [...prev[currentUser.username].orderHistory, orderID],
        totalSpent: prev[currentUser.username].totalSpent + finalAmount,
        walletBalance: prev[currentUser.username].walletBalance - walletDeduction,
        notifications: [...prev[currentUser.username].notifications, notification]
      }
    }));
    setCurrentUser(prev => prev ? {
      ...prev,
      orderHistory: [...prev.orderHistory, orderID],
      totalSpent: prev.totalSpent + finalAmount,
      walletBalance: prev.walletBalance - walletDeduction,
      notifications: [...prev.notifications, notification]
    } : null);

    const kitchenItems = cart.map(item => ({
      itemName: item.itemName, quantity: item.quantity, comment: item.comment,
      prepTime: item.prepTime, orderID,
      orderDate: newOrder.orderDate, orderTime: newOrder.orderTime,
      isPrepared: false, priority: 3
    }));

    setKitchenQueue(prev => [...prev, ...kitchenItems]);
    setTotalRevenue(prev => prev + finalAmount);
    setTotalProfit(prev => prev + finalAmount * 0.4);
    setCart([]);

    return newOrder;
  };

  const markItemPrepared = async (orderID: string) => {
    try {
      const res = await apiService.markItemPrepared(orderID);
      if (res.success) {
        setKitchenQueue(res.kitchenQueue);
        if (res.order) {
          setOrders(prev => prev.map(o => o.orderID === orderID ? res.order! : o));
        }
        await fetchBackendData();
        return;
      }
    } catch (err) {
      console.error('Mark prepared API error:', err);
    }

    setKitchenQueue(prev =>
      prev.map(item => item.orderID === orderID ? { ...item, isPrepared: true } : item)
    );

    setOrders(prev => {
      const order = prev.find(o => o.orderID === orderID);
      if (order && !order.isCompleted) {
        const completionNotification: Notification = {
          orderID, username: order.username,
          message: `Your order #${orderID} has been completed successfully! Please collect your order.`,
          timestamp: new Date().toLocaleTimeString(), isRead: false
        };

        setUsers(usersState => ({
          ...usersState,
          [order.username]: {
            ...usersState[order.username],
            notifications: [...(usersState[order.username]?.notifications || []), completionNotification]
          }
        }));

        setCurrentUser(u => {
          if (u && u.username === order.username) {
            return { ...u, notifications: [...u.notifications, completionNotification] };
          }
          return u;
        });
      }
      return prev.map(o => o.orderID === orderID ? { ...o, isCompleted: true } : o);
    });
  };

  const addWalletBalance = async (amount: number) => {
    if (!currentUser) return;
    try {
      const res = await apiService.addWalletBalance(currentUser.username, amount);
      if (res.success) {
        setUsers(prev => ({ ...prev, [currentUser.username]: res.user }));
        setCurrentUser(res.user);
        return;
      }
    } catch (err) {
      console.error('Add wallet balance error:', err);
    }

    setUsers(prev => ({
      ...prev,
      [currentUser.username]: {
        ...prev[currentUser.username],
        walletBalance: prev[currentUser.username].walletBalance + amount
      }
    }));
    setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance + amount } : null);
  };

  const markNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const res = await apiService.markNotificationsRead(currentUser.username);
      if (res.success) {
        setUsers(prev => ({ ...prev, [currentUser.username]: res.user }));
        setCurrentUser(res.user);
        return;
      }
    } catch (err) {
      console.error('Mark notifications read error:', err);
    }

    setUsers(prev => ({
      ...prev,
      [currentUser.username]: {
        ...prev[currentUser.username],
        notifications: prev[currentUser.username].notifications.map(n => ({ ...n, isRead: true }))
      }
    }));
    setCurrentUser(prev => prev ? {
      ...prev, notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
    } : null);
  };

  const submitRating = async (itemName: string, stars: number, comment?: string, orderID?: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await apiService.submitRating({
        username: currentUser.username,
        itemName,
        stars,
        comment: comment || '',
        orderID: orderID || ''
      });
      if (res.success) {
        setRatingsState(prev => [...prev, res.rating]);
        await fetchBackendData();
        return true;
      }
    } catch (err) {
      console.error('Submit rating API error:', err);
    }
    return false;
  };

  return (
    <CafeContext.Provider value={{
      currentUser, users, orders, cart, kitchenQueue, trendingDishes,
      menuItems: menuItemsState, ratings: ratingsState,
      totalRevenue, totalProfit, foodPreference, isBackendConnected,
      registerUser, loginUser, logoutUser, setFoodPreference, setWalletPin,
      addToCart, removeFromCart, updateCartQuantity, updateCartComment, clearCart,
      createOrder, markItemPrepared, addWalletBalance, markNotificationsRead,
      submitRating, refreshBackendData: fetchBackendData
    }}>
      {children}
    </CafeContext.Provider>
  );
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) throw new Error('useCafe must be used within CafeProvider');
  return context;
}
