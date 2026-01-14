import { app } from "./app.js";
import { connectDb } from "./lib/db.js";
import { config } from "dotenv";

config();

const PORT = process.env.PORT || 8000;

// Server startup
app.listen(PORT, () => {
  connectDb();
  console.log(`Server running on ${PORT}`);
});
