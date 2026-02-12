import Stocks from "../models/stocks.model.js";
import { sendSMS } from "../utils/smsService.js";

export const checkAndSendStockAlerts = async () => {
  try {
    // Threshold configuration
    const STOCK_LEVELS = {
      LOW: 30,
      OUT: 0,
    };

    // Notification cooldowns (in milliseconds)
    const NOTIFICATION_COOLDOWNS = {
      LOW: 1 * 60 * 1000, // 10 minutes for low stock
      OUT: 5 * 60 * 1000, // 5 minutes for out-of-stock
    };

    // Helper to check cooldown in query
    const checkCooldown = (field, duration) => ({
      $or: [
        { [field]: { $exists: false } }, // Never notified
        { [field]: null },
        { [field]: { $lt: Date.now() - duration } }, // Or notified long ago
      ],
    });

    // Run parallel queries for Alerts
    const [lowStockAlerts, outStockAlerts] = await Promise.all([
      Stocks.find({
        quantity: { $lte: STOCK_LEVELS.LOW, $gt: STOCK_LEVELS.OUT },
        ...checkCooldown("lastLowStockNotification", NOTIFICATION_COOLDOWNS.LOW),
      })
        .populate("product", "productName")
        .populate("supplier", "supplierName contactNumber enableNotifications"),

      Stocks.find({
        quantity: STOCK_LEVELS.OUT,
        ...checkCooldown(
          "lastOutOfStockNotification",
          NOTIFICATION_COOLDOWNS.OUT
        ),
      })
        .populate("product", "productName")
        .populate("supplier", "supplierName contactNumber enableNotifications"),
    ]);

    const ADMIN_PHONENUMBER = process.env.ADMIN_PHONENUMBER;

    // Process LOW Stock Alerts
    if (lowStockAlerts.length > 0) {
      if (ADMIN_PHONENUMBER) {
        await sendSMS(
          ADMIN_PHONENUMBER,
          `ALERT: LOW STOCK ITEMS (${lowStockAlerts.length}) \n
        URGENT! The following items are critically low:\n\n${lowStockAlerts
          .map(
            (item) =>
              `- ${item.product?.productName}: ${item.quantity} remaining`
          )
          .join("\n")}\n\nRestock immediately!`
        );
      }

      const supplierAlerts = {};
      lowStockAlerts.forEach((item) => {
        if (
          item.supplier &&
          item.supplier.contactNumber &&
          item.supplier.enableNotifications !== false
        ) {
          if (!supplierAlerts[item.supplier._id]) {
            supplierAlerts[item.supplier._id] = {
              supplier: item.supplier,
              products: [],
            };
          }
          supplierAlerts[item.supplier._id].products.push({
            name: item.product?.productName,
            quantity: item.quantity,
          });
        }
      });

      await Promise.all(
        Object.values(supplierAlerts).map(async ({ supplier, products }) => {
          const message =
            `Low Stock Alert for ${supplier.supplierName}:\n\n` +
            `The following products are running low:\n` +
            products
              .map((p) => `- ${p.name} (${p.quantity} units left)`)
              .join("\n") +
            `\n\nPlease arrange restocking soon. FROM: RM TOYS`;

          await sendSMS(supplier.contactNumber, message);
        })
      );

      await Promise.all(
        lowStockAlerts.map((item) =>
          Stocks.findByIdAndUpdate(item._id, {
            lastLowStockNotification: Date.now(),
          })
        )
      );
    }

    // Process OUT OF STOCK Alerts
    if (outStockAlerts.length > 0) {
      if (ADMIN_PHONENUMBER) {
        await sendSMS(
          ADMIN_PHONENUMBER,
          `EMERGENCY: OUT-OF-STOCK ITEMS (${outStockAlerts.length}) \n
        CRITICAL! The following items are completely out of stock:\n\n${outStockAlerts
          .map((item) => `- ${item.product?.productName}`)
          .join("\n")}\n\nTake immediate action! FROM: RM TOYS`
        );
      }

      const supplierAlerts = {};
      outStockAlerts.forEach((item) => {
        if (
          item.supplier &&
          item.supplier.contactNumber &&
          item.supplier.enableNotifications !== false
        ) {
          if (!supplierAlerts[item.supplier._id]) {
            supplierAlerts[item.supplier._id] = {
              supplier: item.supplier,
              products: [],
            };
          }
          supplierAlerts[item.supplier._id].products.push(
            item.product?.productName
          );
        }
      });

      await Promise.all(
        Object.values(supplierAlerts).map(async ({ supplier, products }) => {
          const message = `URGENT: ${
            supplier.supplierName
          },\n\nThe following products you supply are OUT OF STOCK:\n\n${products.join(
            "\n"
          )}\n\nImmediate restocking is required to avoid business disruption.`;

          await sendSMS(supplier.contactNumber, message);
        })
      );

      await Promise.all(
        outStockAlerts.map((item) =>
          Stocks.findByIdAndUpdate(item._id, {
            lastOutOfStockNotification: Date.now(),
          })
        )
      );
    }
  } catch (error) {
    console.error("Error in checkAndSendStockAlerts:", error);
  }
};
