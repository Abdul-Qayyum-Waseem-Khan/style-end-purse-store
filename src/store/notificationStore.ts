import { create } from 'zustand';
import axiosInstance from '../api/axios';

export interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addRealtimeNotification: (notification: any) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axiosInstance.get('/api/v1/notifications');
      set({ notifications: data.data || [] });
      get().fetchUnreadCount();
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/notifications/unread-count');
      set({ unreadCount: data.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await axiosInstance.put(`/api/v1/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosInstance.put('/api/v1/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },

  clearAllNotifications: async () => {
    try {
      await axiosInstance.delete('/api/v1/notifications/clear-all');
      set({
        notifications: [],
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Failed to clear notifications', error);
    }
  },

  addRealtimeNotification: (payload: any) => {
    const newNotif: Notification = {
      _id: Date.now().toString(), // temporary ID since we don't have the DB ID from FCM
      title: payload?.notification?.title || 'New Notification',
      body: payload?.notification?.body || '',
      type: 'general', // Default fallback
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
