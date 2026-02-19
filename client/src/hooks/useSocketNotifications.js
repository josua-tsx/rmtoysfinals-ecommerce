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
export const useSocketNotifications = (user) => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const isAdmin =
    user?.role === "admin" || user?.role === "validatorStaff" || user?.isAdmin;
  const isCustomer = user?.role === "customer" || (!user?.role && user?._id);

  useEffect(() => {
    if (!user) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (isAdmin) {
      socket.emit("join-admin-room");
      console.log("Joined admin room");

      const handleNewTicket = (data) => {
        addNotification({
          type: "new-ticket",
          title: `New Ticket from ${data.customerName}`,
          message: data.subject,
          ticketId: data.ticketId,
          priority: data.priority,
        });

        toast.success(`🎫 New Ticket: ${data.subject}`, {
          duration: 4000,
          position: "top-right",
        });
      };

      const handleCustomerReply = (data) => {
        addNotification({
          type: "new-ticket-reply",
          title: `Reply on: ${data.subject}`,
          message: `${data.customerName}: ${data.replyPreview}...`,
          ticketId: data.ticketId,
        });

        toast.success(`💬 New reply: ${data.subject}`, {
          duration: 4000,
          position: "top-right",
        });
      };

      socket.on("new-ticket", handleNewTicket);
      socket.on("new-ticket-reply", handleCustomerReply);

      return () => {
        socket.off("new-ticket", handleNewTicket);
        socket.off("new-ticket-reply", handleCustomerReply);
      };
    }

    if (isCustomer) {
      socket.emit("join-customer-room", user._id);
      console.log(`Joined customer room: ${user._id}`);

      const handleAdminReply = (data) => {
        addNotification({
          type: "admin-reply",
          title: "Reply from Support",
          message: `${data.adminName}: ${data.replyPreview}`,
          ticketId: data.ticketId,
          timestamp: new Date().toISOString(),
        });

        toast.success(`💬 Support: ${data.replyPreview}`, {
          duration: 4000,
          icon: "💬",
          position: "top-right",
        });
      };

      socket.on("admin-reply", handleAdminReply);

      return () => {
        socket.off("admin-reply", handleAdminReply);
      };
    }
  }, [user, isAdmin, isCustomer, addNotification]);
};
