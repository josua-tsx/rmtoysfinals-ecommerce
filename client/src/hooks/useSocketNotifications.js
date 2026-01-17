import { useEffect } from "react";
import { socket } from "../lib/socket";
import toast from "react-hot-toast";
import { useNotificationStore } from "../stores/useNotificationStore";

/**
 * Custom hook to listen for real-time Socket.io notifications.
 * Only activates for admin users.
 * 
 * @param {boolean} isAdmin - Whether the current user is an admin.
 */
export const useSocketNotifications = (isAdmin) => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    // Only connect if user is an admin
    if (!isAdmin) return;

    // Connect to socket server
    socket.connect();
    
    // Join admin room for targeted notifications
    socket.emit("join-admin-room");

    // Listen for new ticket notifications
    socket.on("new-ticket", (data) => {
      // Add to store
      addNotification({
        type: "new-ticket",
        title: `New Ticket from ${data.customerName}`,
        message: data.subject,
        ticketId: data.ticketId,
        priority: data.priority,
      });

      // Show toast
      toast.success(
        `🎫 New Ticket: ${data.subject}`,
        {
          duration: 4000,
          position: "top-right",
        }
      );
    });

    // Listen for new reply notifications
    socket.on("new-ticket-reply", (data) => {
      // Add to store
      addNotification({
        type: "new-ticket-reply",
        title: `Reply on: ${data.subject}`,
        message: `${data.customerName}: ${data.replyPreview}...`,
        ticketId: data.ticketId,
      });

      // Show toast
      toast.success(
        `💬 New reply: ${data.subject}`,
        {
          duration: 4000,
          position: "top-right",
        }
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off("new-ticket");
      socket.off("new-ticket-reply");
      socket.disconnect();
    };
  }, [isAdmin, addNotification]);
};
