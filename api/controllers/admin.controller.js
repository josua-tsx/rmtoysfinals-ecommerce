import Address from "../models/address.models.js";
import Audit from "../models/audit.model.js";
import Cart from "../models/cart.model.js";
import Category from "../models/category.model.js";
import Faqs from "../models/faqs.model.js";
import Order from "../models/order.model.js";
import OrderStockHistory from "../models/orderStockHistory.models.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import Rider from "../models/rider.models.js";
import SendEmail from "../models/sendEmail.model.js";
import Stocks from "../models/stocks.model.js";
import Subscribe from "../models/subscribe.model.js";
import Supplier from "../models/supplier.model.js";
import Ticket from "../models/ticket.model.js";
import User from "../models/user.models.js";
import Vat from "../models/vat.models.js";
import { handleMakeError } from "../middleware/handleError.js";

/**
 * Reset Database - Deletes all data except Admin accounts and Store Info
 * ⚠️ DANGEROUS OPERATION - Use with caution!
 * 
 * Security measures:
 * - Requires admin authentication
 * - Requires confirmation key in request body
 * - Only works in non-production (can be overridden)
 */
export const resetDatabase = async (req, res, next) => {
  const { confirmationKey, forceProduction } = req.body;

  // Security: Require confirmation key
  const REQUIRED_KEY = "RESET_ALL_DATA_CONFIRM";
  if (confirmationKey !== REQUIRED_KEY) {
    return next(
      handleMakeError(400, `Invalid confirmation key. Send { confirmationKey: "${REQUIRED_KEY}" } to confirm.`)
    );
  }

  // Security: Block in production unless explicitly forced
  if (process.env.NODE_ENV === "production" && !forceProduction) {
    return next(
      handleMakeError(403, "Database reset is blocked in production. Set forceProduction: true to override.")
    );
  }

  try {
    const results = {};

    // Delete all data from each collection (except User admins and StoreInfo)
    results.addresses = await Address.deleteMany({});
    results.audits = await Audit.deleteMany({});
    results.carts = await Cart.deleteMany({});
    results.categories = await Category.deleteMany({});
    results.faqs = await Faqs.deleteMany({});
    results.orders = await Order.deleteMany({});
    results.orderStockHistory = await OrderStockHistory.deleteMany({});
    results.products = await Product.deleteMany({});
    results.reviews = await Review.deleteMany({});
    results.riders = await Rider.deleteMany({});
    results.sendEmails = await SendEmail.deleteMany({});
    results.stocks = await Stocks.deleteMany({});
    results.subscriptions = await Subscribe.deleteMany({});
    results.suppliers = await Supplier.deleteMany({});
    results.tickets = await Ticket.deleteMany({});
    results.vats = await Vat.deleteMany({});

    // Delete non-admin users only (preserve admins)
    results.users = await User.deleteMany({ role: { $ne: "admin" } });

    // StoreInfo is NOT deleted (preserved)

    res.status(200).json({
      success: true,
      message: "Database reset complete. Admin accounts and Store Info preserved.",
      deletedCounts: {
        addresses: results.addresses.deletedCount,
        audits: results.audits.deletedCount,
        carts: results.carts.deletedCount,
        categories: results.categories.deletedCount,
        faqs: results.faqs.deletedCount,
        orders: results.orders.deletedCount,
        orderStockHistory: results.orderStockHistory.deletedCount,
        products: results.products.deletedCount,
        reviews: results.reviews.deletedCount,
        riders: results.riders.deletedCount,
        sendEmails: results.sendEmails.deletedCount,
        stocks: results.stocks.deletedCount,
        subscriptions: results.subscriptions.deletedCount,
        suppliers: results.suppliers.deletedCount,
        tickets: results.tickets.deletedCount,
        vats: results.vats.deletedCount,
        users: results.users.deletedCount,
      },
      preserved: ["Admin Users", "Store Info"],
    });
  } catch (error) {
    next(error);
  }
};
