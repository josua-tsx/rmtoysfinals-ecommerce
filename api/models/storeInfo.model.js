import mongoose from "mongoose";

/**
 * =============================================================================
 * STORE INFO MODEL
 * =============================================================================
 * 
 * This is a SINGLETON model - only one document should exist.
 * It stores all the configurable information about the store that the AI
 * chatbot needs to provide accurate, contextual responses.
 * 
 * AI ENGINEERING CONCEPT: "Context Source"
 * ----------------------------------------
 * This model serves as a "knowledge base" for the AI. Instead of hardcoding
 * information in the system prompt, we store it in the database so:
 * 1. Admins can update it without code changes
 * 2. The AI always has the latest information
 * 3. We can track what information the AI has access to
 */

const StoreInfoSchema = new mongoose.Schema(
  {
    // ==========================================================================
    // BASIC STORE INFORMATION
    // ==========================================================================
    storeName: {
      type: String,
      default: "RM Toys",
    },
    tagline: {
      type: String,
      default: "Your Trusted Online Toy Store in the Philippines",
    },
    aboutUs: {
      type: String,
      default: "",
    },

    // ==========================================================================
    // OWNER INFORMATION
    // This is what you asked about - who owns the store?
    // ==========================================================================
    ownerName: {
      type: String,
      default: "",
    },
    ownerStory: {
      type: String,
      default: "",
      // Example: "RM Toys was founded by Maria Santos in 2020 with a passion
      // for bringing quality, affordable toys to Filipino children..."
    },

    // ==========================================================================
    // CONTACT INFORMATION
    // ==========================================================================
    contactEmail: {
      type: String,
      default: "",
    },
    contactPhone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    businessHours: {
      type: String,
      default: "Monday-Saturday, 9AM-6PM (Philippine Time)",
    },

    // ==========================================================================
    // POLICIES - Common customer questions
    // ==========================================================================
    shippingPolicy: {
      type: String,
      default: "",
      // Example: "Free shipping for orders over ₱1,500. Metro Manila: 2-3 days.
      // Provincial: 5-7 days."
    },
    returnPolicy: {
      type: String,
      default: "",
      // Example: "Returns accepted within 7 days with original receipt and
      // unopened packaging."
    },
    paymentMethods: {
      type: [String],
      default: ["GCash", "COD"],
    },

    // ==========================================================================
    // SOCIAL MEDIA LINKS
    // ==========================================================================
    socialMedia: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
    },

    // ==========================================================================
    // CUSTOM AI RULES
    // ==========================================================================
    /**
     * AI ENGINEERING CONCEPT: "Dynamic Rules"
     * ---------------------------------------
     * These are additional rules that admins can add to the AI's behavior
     * without touching the code. This makes the system flexible.
     * 
     * Example rules:
     * - "If asked about 'Baby Shark' toys, mention our current 20% discount"
     * - "Always recommend our loyalty program for orders over ₱2,000"
     */
    customPromptRules: {
      type: [String],
      default: [],
    },

    // ==========================================================================
    // SPECIAL RESPONSES
    // ==========================================================================
    /**
     * AI ENGINEERING CONCEPT: "Persona Triggers"
     * ------------------------------------------
     * Special questions that should trigger specific responses.
     * This is like the "girlie marie" rules you already have, but configurable!
     */
    specialResponses: [
      {
        trigger: { type: String }, // Keywords or phrases to match
        response: { type: String }, // What the AI should say
      },
    ],
  },
  {
    timestamps: true,
  }
);

const StoreInfo = mongoose.model("StoreInfo", StoreInfoSchema);

export default StoreInfo;
