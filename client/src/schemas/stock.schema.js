import { z } from "zod";

export const supplierPriceSchema = z.coerce.number({ required_error: "Supplier Price is required" })
    .positive("Supplier price must be positive")
    .max(1000000, "Supplier price cannot exceed 1 Million");

export const shopPriceSchema = z.coerce.number({ required_error: "Shop Price is required" })
    .positive("Shop price must be positive")
    .max(1000000, "Shop price cannot exceed 1 Million");

export const shippingPriceSchema = z.coerce.number({ required_error: "Shipping Price is required" })
    .nonnegative("Shipping price cannot be negative")
    .max(10000, "Shipping price cannot exceed 10k");

export const quantitySchema = z.coerce.number({ required_error: "Quantity is required" })
    .min(11, "Quantity must be at least 11")
    .max(1000, "Quantity cannot exceed 1000");

export const dateDeliverySchema = z.string().min(1, "Please select a delivery date");

export const orderStockSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  supplier: z.string().min(1, "Please select a supplier"),
  deliveryId: z.string().min(1, "Delivery ID is required"),
  dateDelivery: dateDeliverySchema,
  supplierPrice: supplierPriceSchema,
  shopPrice: shopPriceSchema,
  shippingPrice: shippingPriceSchema,
  quantity: quantitySchema,
  totalCost: z.coerce.number().optional(),
  vat: z.string().optional().nullable().or(z.literal("")),
  vatShopPrice: z.coerce.number().optional(),
  notifySubscribedUser: z.boolean().optional(),
}).refine((data) => data.shopPrice >= data.supplierPrice, {
  message: "Shop price cannot be lower than supplier price",
  path: ["shopPrice"],
});
