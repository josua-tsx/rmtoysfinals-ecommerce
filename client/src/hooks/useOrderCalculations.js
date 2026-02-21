import { useMemo } from "react";

const ROUND = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Shared hook for calculating order totals, VAT, and points.
 *
 * @param {Array} cartItems - Cart items array
 * @param {number} shippingFee - Shipping fee amount
 * @param {object} options
 * @param {function} options.getPrice - Accessor for item price (default: item => item?.productId?.price)
 * @param {function} options.getTaxStatus - Accessor for tax status (default: item => item?.productId?.taxStatus)
 * @param {function} options.getPoints - Accessor for points (default: item => item?.productId?.points)
 * @param {function} options.getVatPercent - Accessor for VAT percent (default: item => item?.productId?.vat?.vatPercent)
 * @returns {{ subtotal, vatableSalesNet, vatExemptSales, totalVatAmount, totalPoints, totalPrice }}
 */
export default function useOrderCalculations(cartItems, shippingFee, options = {}) {
  const {
    getPrice = (item) => item?.productId?.price,
    getTaxStatus = (item) => item?.productId?.taxStatus,
    getPoints = (item) => item?.productId?.points,
    getVatPercent = (item) => item?.productId?.vat?.vatPercent,
  } = options;

  return useMemo(() => {
    const shippingGross = Number(shippingFee || 0);

    let grossExempt = 0;
    let points = 0;
    let itemsSubtotal = 0;

    for (const item of cartItems || []) {
      const price = Number(getPrice(item) || 0);
      const qty = Number(item?.quantity || 0);
      const gross = price * qty;
      const taxStatus = (getTaxStatus(item) || "").toLowerCase();

      itemsSubtotal += gross;
      points += Number(getPoints(item) || 0) * qty;

      if (taxStatus !== "vatable") {
        grossExempt += gross;
      }
    }

    // Calculate VAT from vatable items (VAT-inclusive pricing)
    let totalVatableNet = 0;
    let totalVatAmount = 0;

    for (const item of cartItems || []) {
      const taxStatus = (getTaxStatus(item) || "").toLowerCase();
      if (taxStatus === "vatable") {
        const price = Number(getPrice(item) || 0);
        const qty = Number(item?.quantity || 0);
        const gross = price * qty;

        const vatRate = getVatPercent(item) ?? 12;
        const vatFactor = 1 + vatRate / 100;

        const net = gross / vatFactor;
        const vat = gross - net;

        totalVatableNet += net;
        totalVatAmount += vat;
      }
    }

    const subtotal = ROUND(itemsSubtotal);
    const totalPrice = ROUND(itemsSubtotal + shippingGross);

    return {
      subtotal,
      vatableSalesNet: ROUND(totalVatableNet),
      vatExemptSales: ROUND(grossExempt),
      totalVatAmount: ROUND(totalVatAmount),
      totalPoints: points,
      totalPrice,
    };
  }, [cartItems, shippingFee, getPrice, getTaxStatus, getPoints, getVatPercent]);
}
