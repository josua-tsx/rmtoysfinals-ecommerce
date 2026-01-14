import { createProductSchema } from "./schema/product.schema.js";
import mongoose from "mongoose";

// Mock Data
const validProduct = {
  body: {
    productName: "Valid Product Name",
    productDescription: "This is a valid description",
    category: new mongoose.Types.ObjectId().toString(),
    productImages: ["image1.png"],
    price: 100,
    taxStatus: "non-vatable",
    vat: null
  },
  query: {},
  params: {}
};

const invalidProduct = {
  body: {
    productName: "Bad", // Too short
    productDescription: "", // Empty
    category: "invalid-id", // Not an ObjectId
    productImages: [], // Empty array
    price: -10, // Negative
    taxStatus: "vatable", // Vatable but no VAT ID
    vat: null
  },
  query: {},
  params: {}
};

console.log("--- TESTING VALID PRODUCT ---");
const result1 = createProductSchema.safeParse(validProduct);
if (result1.success) {
  console.log("✅ Valid Product passed!");
} else {
  console.log("❌ Valid Product failed:", result1.error.format());
}

console.log("\n--- TESTING INVALID PRODUCT ---");
const result2 = createProductSchema.safeParse(invalidProduct);
if (!result2.success) {
  console.log("✅ Invalid Product correctly rejected!");
  console.log("Errors found (Expected):");
  const errors = result2.error.format().body;
  if(errors.productName) console.log("- Name:", errors.productName._errors);
  if(errors.productDescription) console.log("- Desc:", errors.productDescription._errors);
  if(errors.category) console.log("- Category:", errors.category._errors);
  if(errors.productImages) console.log("- Images:", errors.productImages._errors);
  // Custom refined error for VAT might be on the root or field depending on implementation, 
  // checking 'vat' specifically or general _errors
  if(errors.vat) console.log("- Vat:", errors.vat._errors);
} else {
  console.log("❌ Invalid Product passed (Unexpected)!");
}
