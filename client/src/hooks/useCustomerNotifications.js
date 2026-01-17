import { useEffect } from "react";
import { socket } from "../lib/socket";
import toast from "react-hot-toast";
import { useNotificationStore } from "../stores/useNotificationStore";

/**
 * Custom hook to listen for real-time Socket.io notifications for customers.
 * Connects to the customer's personal room based on userId.
 * 
 * @param {string} userId - The current user's ID.
 */
export const useCustomerNotifications = (userId) => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    // Only connect if user is logged in
    if (!userId) return;

    // Connect to socket server
    socket.connect();
    
    // Join customer-specific room
    socket.emit("join-customer-room", userId);

    // Listen for admin reply notifications
    socket.on("admin-reply", (data) => {
      // Add to store
      addNotification({
        type: "admin-reply",
        title: `Reply from ${data.adminName}`,
        message: `${data.subject}: ${data.replyPreview}...`,
        ticketId: data.ticketId,
      });

      // Show toast
      toast.success(
        `💬 Support replied to: ${data.subject}`,
        {
          duration: 5000,
          position: "top-right",
        }
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off("admin-reply");
      socket.disconnect();
    };
  }, [userId, addNotification]);
};
