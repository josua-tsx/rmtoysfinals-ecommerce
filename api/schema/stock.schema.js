import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ID format",
});

export const stockBodyBase = z.object({
    product: objectIdSchema,
    supplier: objectIdSchema,
    deliveryId: z.string({ required_error: "Delivery ID is required" }),
    dateDelivery: z.coerce.date({ required_error: "Date Delivery is required" }),
    
    supplierPrice: z.coerce.number({ required_error: "Supplier Price is required" })
        .positive("Supplier price must be positive")
        .max(1000000, "Supplier price cannot exceed 1 Million"),
    
    shopPrice: z.coerce.number({ required_error: "Shop Price is required" })
        .positive("Shop price must be positive")
        .max(1000000, "Shop price cannot exceed 1 Million"),
    
    shippingPrice: z.coerce.number({ required_error: "Shipping Price is required" })
        .nonnegative("Shipping price cannot be negative")
        .max(10000, "Shipping price cannot exceed 10k"),
    
    quantity: z.coerce.number({ required_error: "Quantity is required" })
        .min(11, "Quantity must be at least 11")
        .max(1000, "Quantity cannot exceed 1000"),
    
    totalCost: z.coerce.number().optional(),
    
    vat: objectIdSchema.optional().or(z.literal(null)).or(z.literal("")), // VAT ID, null, or empty string (exempt)
    notifySubscribedUser: z.boolean().optional(),
  });

export const orderStockSchema = z.object({
  body: stockBodyBase.refine((data) => data.shopPrice >= data.supplierPrice, {
      message: "Shop price cannot be lower than supplier price",
      path: ["shopPrice"],
  }),
});

export const reorderStockSchema = z.object({
  params: z.object({
    stockId: objectIdSchema,
  }),
  body: z.object({
    product: objectIdSchema.optional(),
    supplier: objectIdSchema,
    deliveryId: z.string({ required_error: "Delivery ID is required" }),
    dateDelivery: z.coerce.date({ required_error: "Date Delivery is required" }),
    
    supplierPrice: z.coerce.number({ required_error: "Supplier Price is required" })
        .positive("Supplier price must be positive")
        .max(1000000, "Supplier price cannot exceed 1 Million"),
    
    shopPrice: z.coerce.number({ required_error: "Shop Price is required" })
        .positive("Shop price must be positive")
        .max(1000000, "Shop price cannot exceed 1 Million"),

    shippingPrice: z.coerce.number({ required_error: "Shipping Price is required" })
        .nonnegative("Shipping price cannot be negative")
        .max(10000, "Shipping price cannot exceed 10k"),
        
    quantity: z.coerce.number({ required_error: "Quantity is required" })
        .positive("Quantity must be greater than 0") // Reorder might allow smaller amounts? Controller had > 0
        .max(1000, "Quantity cannot exceed 1000"),
    
    totalCost: z.coerce.number().optional(),
    category: objectIdSchema.optional(),
    
    vatPercent: objectIdSchema.optional().or(z.literal(null)), // Used as ID or null in controller
  }).refine((data) => data.shopPrice >= data.supplierPrice, {
      message: "Shop price cannot be lower than supplier price",
      path: ["shopPrice"],
  }),
});

export const updateStockQuantitySchema = z.object({
  params: z.object({
    stockId: objectIdSchema,
  }),
  body: z.object({
    quantity: z.coerce.number({ required_error: "Quantity is required" })
        .nonnegative("Quantity cannot be negative"),
  }),
});
