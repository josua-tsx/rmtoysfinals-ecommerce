import { io } from "socket.io-client";

// Socket.io needs the base URL, not the /api path
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

console.log("🔌 Socket.io connecting to:", API_BASE_URL);

/**
 * Socket.io client instance.
 * - autoConnect: false - We manually connect for admins only.
 * - withCredentials: true - Send cookies for authentication.
 */
export const socket = io(API_BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

// Debug connection events
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

