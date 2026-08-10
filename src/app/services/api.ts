import { User, OrderRecord, OrderItem, KitchenPrepItem, MenuItem, RatingRecord } from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const apiService = {
  // Auth API
  register: (data: { username: string; password: string; email: string; phoneNumber?: string }) =>
    request<{ success: boolean; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { username: string; password: string }) =>
    request<{ success: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  addWalletBalance: (username: string, amount: number) =>
    request<{ success: boolean; user: User }>('/auth/wallet/add', {
      method: 'POST',
      body: JSON.stringify({ username, amount })
    }),

  setWalletPin: (username: string, pin: string) =>
    request<{ success: boolean; user: User }>('/auth/wallet/pin', {
      method: 'POST',
      body: JSON.stringify({ username, pin })
    }),

  markNotificationsRead: (username: string) =>
    request<{ success: boolean; user: User }>('/auth/notifications/read', {
      method: 'PUT',
      body: JSON.stringify({ username })
    }),

  // Menu API
  getMenu: () => request<MenuItem[]>('/menu'),

  addMenuItem: (item: MenuItem) =>
    request<{ success: boolean; item: MenuItem }>('/menu', {
      method: 'POST',
      body: JSON.stringify(item)
    }),

  // Order API
  getOrders: () => request<OrderRecord[]>('/orders'),

  getUserOrders: (username: string) => request<OrderRecord[]>(`/orders/user/${username}`),

  createOrder: (data: {
    username: string;
    items: OrderItem[];
    paymentMethod: string;
    splitPeople?: number;
    perPersonAmount?: number;
  }) =>
    request<{ success: boolean; order: OrderRecord; user: User }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Kitchen API
  getKitchenQueue: () => request<KitchenPrepItem[]>('/kitchen'),

  markItemPrepared: (orderID: string) =>
    request<{ success: boolean; kitchenQueue: KitchenPrepItem[]; order?: OrderRecord }>('/kitchen/mark-prepared', {
      method: 'PUT',
      body: JSON.stringify({ orderID })
    }),

  // Ratings API
  getRatings: (itemName?: string) =>
    request<RatingRecord[]>(`/ratings${itemName ? `?itemName=${encodeURIComponent(itemName)}` : ''}`),

  submitRating: (data: {
    username: string;
    itemName: string;
    stars: number;
    comment?: string;
    orderID?: string;
  }) =>
    request<{ success: boolean; rating: RatingRecord; item?: MenuItem }>('/ratings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Analytics & Users API
  getAnalytics: () =>
    request<{
      totalRevenue: number;
      totalProfit: number;
      trendingDishes: Record<string, number>;
      totalUsers: number;
      totalOrders: number;
      activeOrders: number;
    }>('/analytics'),

  getUsers: () => request<Record<string, User>>('/users')
};
