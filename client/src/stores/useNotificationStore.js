import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Zustand store for managing admin notifications.
 * Persists to localStorage so notifications survive page refresh.
 */
export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      // Add a new notification
      addNotification: (notification) => {
        const newNotification = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          isRead: false,
          ...notification,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
          unreadCount: state.unreadCount + 1,
        }));
      },

      // Mark a notification as read
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      // Mark all as read
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      // Delete a notification
      deleteNotification: (id) => {
        set((state) => {
          const notif = state.notifications.find((n) => n.id === id);
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: notif && !notif.isRead ? state.unreadCount - 1 : state.unreadCount,
          };
        });
      },

      // Clear all notifications
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: "admin-notifications",
    }
  )
);
