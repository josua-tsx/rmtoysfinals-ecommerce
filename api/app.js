import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { handleError } from "./middleware/handleError.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// routes import
import authRoutes from "../api/routes/auth.route.js";
import productRoutes from "../api/routes/product.route.js";
import userRoutes from "../api/routes/user.route.js";
import supplierRoutes from "../api/routes/supplier.route.js";
import categoryRoutes from "../api/routes/category.route.js";
import stocksRoutes from "../api/routes/stocks.route.js";
import addressRoutes from "../api/routes/address.route.js";
import cartRoutes from "../api/routes/cart.route.js";
import orderRoutes from "../api/routes/order.route.js";
import auditRoute from "../api/routes/audit.route.js";
import reviewRoute from "../api/routes/review.route.js";
import vatRoute from "../api/routes/vat.route.js";
import sendEmailRoute from "../api/routes/sendEmail.route.js";
import orderStockHistory from "../api/routes/orderStockHistory.route.js";
import subscribeRoute from "../api/routes/subscribe.route.js";
import faqsRoute from "../api/routes/faqs.route.js";
import riderRoute from "../api/routes/rider.route.js";
import playRoute from "../api/routes/random.route.js";
import geminiRoute from "../api/routes/gemini.route.js";
import chatbotRoute from "../api/routes/chatbot.route.js";
import ticketRoute from "../api/routes/ticket.route.js";
import storeInfoRoute from "../api/routes/storeInfo.route.js";
import invoiceRoute from "../api/routes/invoice.route.js";
import reportRoute from "../api/routes/report.route.js";
import adminRoute from "../api/routes/admin.route.js";
import otpRoute from "../api/routes/otp.route.js";
import pointsRoute from "../api/routes/points.route.js";


// Load environment variables from .env file
config();

const app = express();

// Trust the first proxy (Vercel) so express-rate-limit gets the real client IP
app.set("trust proxy", 1);

// Security headers (XSS, clickjacking, MIME-sniffing, etc.)
app.use(helmet());

export const allowedOrigins = [
  "https://rmtoysfinals-8jgr.vercel.app", // Your Vercel frontend
  "http://localhost:5173", // For local testing (optional)
  "https://www.rmtoys.store",
  // "http://localhost:8081", // react native
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

// console.log(process.env.CLIENT_URL);

app.use(express.json());
app.use(cookieParser());

// Route configurations
// Apply global rate limiter to all API routes
app.use("/api", apiLimiter);

app.use(`/api/auth`, authRoutes);
app.use(`/api/product`, productRoutes);
app.use(`/api/user`, userRoutes);
app.use(`/api/supplier`, supplierRoutes);
app.use(`/api/category`, categoryRoutes);
app.use(`/api/stocks`, stocksRoutes);
app.use(`/api/address`, addressRoutes);
app.use(`/api/cart`, cartRoutes);
app.use(`/api/order`, orderRoutes);
app.use(`/api/audit`, auditRoute);
app.use(`/api/review`, reviewRoute);
app.use(`/api/vat`, vatRoute);
app.use(`/api/send`, sendEmailRoute);
app.use(`/api/history`, orderStockHistory);
app.use(`/api/subscribe`, subscribeRoute);
app.use(`/api/faqs`, faqsRoute);
app.use("/api/rider", riderRoute);
app.use(`/api/random`, playRoute);
app.use(`/api/gemini`, geminiRoute);
app.use(`/api/chatbot`, chatbotRoute);
app.use(`/api/ticket`, ticketRoute);
app.use(`/api/store-info`, storeInfoRoute);
app.use(`/api/invoice`, invoiceRoute);
app.use(`/api/report`, reportRoute);
app.use(`/api/admin`, adminRoute);
app.use(`/api/otp`, otpRoute);
app.use(`/api/points`, pointsRoute);


// Error handling middleware
app.use(handleError);

export { app };
