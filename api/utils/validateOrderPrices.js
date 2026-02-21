import Product from "../models/product.model.js";

const ROUND = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Server-side price re-validation for order placement.
 *
 * Re-fetches product prices from the database and recalculates
 * subtotal / totalPrice to ensure the client hasn't tampered with values.
 *
 * @param {Array} orderItems - Array of { productId, quantity, ... }
 * @param {number} clientSubtotal - Subtotal sent by the client
 * @param {number} clientTotalPrice - Total price sent by the client
 * @param {number} shippingPrice - Shipping fee
 * @param {number} usedCredits - Credits applied (default 0)
 * @param {import('mongoose').ClientSession} [session] - Optional Mongoose session
 * @returns {{ valid: boolean, message?: string, serverSubtotal?: number, serverTotalPrice?: number }}
 */
export async function validateOrderPrices(
  orderItems,
  clientSubtotal,
  clientTotalPrice,
  shippingPrice,
  usedCredits = 0,
  session = null,
) {
  // Extract product IDs (handles both string IDs and { _id } objects)
  const productIds = orderItems.map((item) => {
    if (typeof item.productId === "string") return item.productId;
    return item.productId?._id || item.productId;
  });

  // Fetch authoritative prices and statuses from the database
  const query = Product.find({ _id: { $in: productIds } }).select("_id price status productName");
  const products = session ? await query.session(session) : await query;

  // Build a price map: productId -> { price, status, productName }
  const priceMap = new Map();
  for (const p of products) {
    priceMap.set(p._id.toString(), { price: p.price, status: p.status, productName: p.productName });
  }

  // Verify all products exist and are published
  for (const item of orderItems) {
    const id =
      typeof item.productId === "string"
        ? item.productId
        : item.productId?._id || item.productId;

    const productData = priceMap.get(id.toString());

    if (!productData) {
      return {
        valid: false,
        message: `Product not found: ${id}. It may have been removed.`,
      };
    }

    if (productData.status !== "published") {
      return {
        valid: false,
        message: `"${productData.productName}" is currently unavailable for ordering. Please remove it from your cart and try again.`,
      };
    }
  }

  // Recalculate server-side subtotal
  let serverSubtotal = 0;
  for (const item of orderItems) {
    const id =
      typeof item.productId === "string"
        ? item.productId
        : item.productId?._id || item.productId;

    const serverPrice = priceMap.get(id.toString()).price;
    const qty = Number(item.quantity || 1);
    serverSubtotal += serverPrice * qty;
  }

  serverSubtotal = ROUND(serverSubtotal);
  const serverTotalPrice = ROUND(serverSubtotal + Number(shippingPrice || 0) - Number(usedCredits || 0));

  // Allow a small tolerance for floating-point rounding (±₱1)
  const TOLERANCE = 1;

  if (Math.abs(serverSubtotal - clientSubtotal) > TOLERANCE) {
    return {
      valid: false,
      message: `Price mismatch detected. Expected subtotal ₱${serverSubtotal} but received ₱${clientSubtotal}. Please refresh and try again.`,
      serverSubtotal,
      serverTotalPrice,
    };
  }

  if (Math.abs(serverTotalPrice - clientTotalPrice) > TOLERANCE) {
    return {
      valid: false,
      message: `Total price mismatch detected. Expected ₱${serverTotalPrice} but received ₱${clientTotalPrice}. Please refresh and try again.`,
      serverSubtotal,
      serverTotalPrice,
    };
  }

  return { valid: true, serverSubtotal, serverTotalPrice };
}
