import { Server } from "socket.io";

let io;

/**
 * Initialize Socket.io with the HTTP server.
 * @param {import('http').Server} httpServer - The HTTP server instance.
 * @param {string[]} allowedOrigins - Array of allowed CORS origins.
 * @returns {Server} The Socket.io server instance.
 */
export const initializeSocket = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Admin joins a special room for receiving notifications
    socket.on("join-admin-room", () => {
      socket.join("admin-room");
      console.log("👮 Admin joined admin-room:", socket.id);
    });

    // Customer joins their personal room based on userId
    socket.on("join-customer-room", (userId) => {
      if (userId) {
        socket.join(`customer-${userId}`);
        console.log(`👤 Customer joined customer-${userId}:`, socket.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.id);
    });
  });

  return io;
};

/**
 * Get the Socket.io instance.
 * Use this in controllers to emit events.
 * @returns {Server} The Socket.io server instance.
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized! Call initializeSocket first.");
  }
  return io;
};
