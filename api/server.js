import http from "http";
import { app, allowedOrigins } from "./app.js";
import { connectDb } from "./lib/db.js";
import { config } from "dotenv";
import { initializeSocket } from "./services/socketService.js";

config();

const PORT = process.env.PORT || 8000;

// Create HTTP server and attach Socket.io
const httpServer = http.createServer(app);
initializeSocket(httpServer, allowedOrigins);

// Server startup
httpServer.listen(PORT, () => {
  connectDb();
  console.log(`Server running on ${PORT}`);
});
