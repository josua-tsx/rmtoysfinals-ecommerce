import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors"; // Uncomment this line
import { connectDb } from "./lib/db.js";
import { handleError } from "./middleware/handleError.js";

// routes import
import authRoutes from "../api/routes/auth.route.js";
import productRoutes from "../api/routes/product.route.js";
import userRoutes from "../api/routes/user.route.js";
import supplierRoutes from "../api/routes/supplier.route.js";
import categoryRoutes from "../api/routes/category.route.js";
import stocksRoutes from "../api/routes/stocks.route.js";
import addressRoutes from "../api/routes/address.route.js";
import cartRoutes from "../api/routes/cart.route.js";
import wishlistRoutes from "../api/routes/wishlist.route.js";
import orderRoutes from "../api/routes/order.route.js";
import auditRoute from "../api/routes/audit.route.js";
import reviewRoute from "../api/routes/review.route.js";
import vatRoute from "../api/routes/vat.route.js";
import sendEmailRoute from "../api/routes/sendEmail.route.js";
import orderStockHistory from "../api/routes/orderStockHistory.route.js";
import Address from "./models/address.models.js";
import Vat from "./models/vat.models.js";

// Load environment variables from .env file
config();

const app = express();
const PORT = process.env.PORT;

const allowedOrigins = [
  "https://rmtoysfinals-8jgr.vercel.app", // Your Vercel frontend
  "http://localhost:5173", // For local testing (optional)
  "https://www.rmtoys.store",
  "http://localhost:8081", // react native
];

// CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Must be true
    exposedHeaders: ["set-cookie"], // Helps with cookie issues,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

console.log(process.env.CLIENT_URL);

app.use(express.json());
app.use(cookieParser());

// Route configurations
app.use(`/api/auth`, authRoutes);
app.use(`/api/product`, productRoutes);
app.use(`/api/user`, userRoutes);
app.use(`/api/supplier`, supplierRoutes);
app.use(`/api/category`, categoryRoutes);
app.use(`/api/stocks`, stocksRoutes);
app.use(`/api/address`, addressRoutes);
app.use(`/api/cart`, cartRoutes);
app.use(`/api/wish`, wishlistRoutes);
app.use(`/api/order`, orderRoutes);
app.use(`/api/audit`, auditRoute);
app.use(`/api/review`, reviewRoute);
app.use(`/api/vat`, vatRoute);
app.use(`/api/send`, sendEmailRoute);
app.use(`/api/history`, orderStockHistory);

// Error handling middleware
app.use(handleError);

// async function safeDropProductIndex() {
//   try {
//     // Get all indexes from the vats collection
//     const indexes = await Vat.collection.indexes();

//     // Find the problematic product_1 index
//     const productIndex = indexes.find(index => index.name === "product_1");

//     if (productIndex) {
//       // Drop the index
//       await Vat.collection.dropIndex("product_1");
//       console.log("✅ Dropped product_1 index successfully.");
//     } else {
//       console.log("ℹ️ No product_1 index found, nothing to drop.");
//     }
//   } catch (error) {
//     console.error("❌ Error while dropping product_1 index:", error);

//     // Special handling for MongoDB 4.2+ where you might need to drop the index differently
//     if (error.code === 27 || error.message.includes("not found")) {
//       console.log("⚠️ Trying alternative drop method...");
//       try {
//         await mongoose.connection.db.command({
//           dropIndexes: 'vats',
//           index: 'product_1'
//         });
//         console.log("✅ Successfully dropped index using alternative method");
//       } catch (altError) {
//         console.error("❌ Failed to drop index with alternative method:", altError);
//       }
//     }
//   }
// }

// // // Call it once somewhere after mongoose.connect()
// safeDropProductIndex();

// Server startup
app.listen(PORT, () => {
  connectDb();
  console.log(`Server running on ${PORT}`);
});
