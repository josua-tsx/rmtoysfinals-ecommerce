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
import vatRoute from "../api/routes/vat.route.js"
import sendEmailRoute from "../api/routes/sendEmail.route.js"

// Load environment variables from .env file
config();

const app = express();
const PORT = process.env.PORT;

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Make sure this matches the frontend origin
    credentials: true,
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
app.use(`/api/send`, sendEmailRoute)


// Error handling middleware
app.use(handleError);

// Server startup
app.listen(PORT, () => {
  connectDb();
  console.log(`Server running on ${PORT}`);
});
