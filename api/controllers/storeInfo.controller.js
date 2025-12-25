import StoreInfo from "../models/storeInfo.model.js";

/**
 * =============================================================================
 * STORE INFO CONTROLLER
 * =============================================================================
 * 
 * AI ENGINEERING CONCEPT: "Knowledge Base Management"
 * ---------------------------------------------------
 * This controller manages the store's "knowledge base" - all the information
 * that will be fed to the AI chatbot as context.
 * 
 * Key principle: The AI is only as good as the information it has access to.
 * By making this data editable by admins, we ensure the AI stays up-to-date.
 */

/**
 * GET /api/store-info
 * Public endpoint - anyone can read store info
 */
export const getStoreInfo = async (req, res) => {
  try {
    // Find the single store info document, or return defaults
    let storeInfo = await StoreInfo.findOne().lean();

    if (!storeInfo) {
      // Return default structure if none exists yet
      storeInfo = {
        storeName: "RM Toys",
        tagline: "Your Trusted Online Toy Store in the Philippines",
        aboutUs: "",
        ownerName: "",
        ownerStory: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        businessHours: "Monday-Saturday, 9AM-6PM (Philippine Time)",
        shippingPolicy: "",
        returnPolicy: "",
        paymentMethods: ["GCash", "COD"],
        socialMedia: { facebook: "", instagram: "", tiktok: "" },
        customPromptRules: [],
        specialResponses: [],
      };
    }

    res.json({
      success: true,
      data: storeInfo,
    });
  } catch (error) {
    console.error("Error fetching store info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch store information",
    });
  }
};

/**
 * PUT /api/store-info
 * Admin only - update store info (upsert pattern)
 * 
 * AI ENGINEERING CONCEPT: "Context Refresh"
 * -----------------------------------------
 * When this is called, the next chatbot request will automatically
 * pick up the new information. No restart needed!
 */
export const updateStoreInfo = async (req, res) => {
  try {
    const updateData = req.body;

    // Upsert: Update if exists, create if doesn't
    const storeInfo = await StoreInfo.findOneAndUpdate(
      {}, // Match any document (there should only be one)
      { $set: updateData },
      {
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Store information updated successfully",
      data: storeInfo,
    });
  } catch (error) {
    console.error("Error updating store info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update store information",
    });
  }
};

/**
 * GET /api/store-info/for-chatbot
 * Internal use - formatted specifically for chatbot context injection
 * 
 * AI ENGINEERING CONCEPT: "Context Formatting"
 * -------------------------------------------
 * This endpoint returns the store info FORMATTED for the AI.
 * The format matters! Clear, structured text helps the AI understand better.
 */
export const getStoreInfoForChatbot = async (req, res) => {
  try {
    const storeInfo = await StoreInfo.findOne().lean();

    if (!storeInfo) {
      return res.json({
        success: true,
        context: "No store information configured yet.",
      });
    }

    // Format the context in a way that's easy for the AI to parse
    const formattedContext = formatStoreInfoForAI(storeInfo);

    res.json({
      success: true,
      context: formattedContext,
    });
  } catch (error) {
    console.error("Error fetching chatbot context:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chatbot context",
    });
  }
};

/**
 * HELPER: Format store info for AI consumption
 * 
 * AI ENGINEERING CONCEPT: "Prompt Engineering"
 * -------------------------------------------
 * The way you format information for an AI matters A LOT.
 * 
 * Best practices:
 * 1. Use clear section headers
 * 2. Use consistent formatting (bullet points, etc.)
 * 3. Put the most important info first
 * 4. Be explicit and avoid ambiguity
 */
export const formatStoreInfoForAI = (storeInfo) => {
  const sections = [];

  // About the store
  if (storeInfo.storeName || storeInfo.aboutUs) {
    sections.push(`**ABOUT ${storeInfo.storeName?.toUpperCase() || "THE STORE"}:**
${storeInfo.tagline || ""}
${storeInfo.aboutUs || ""}`);
  }

  // Owner information
  if (storeInfo.ownerName || storeInfo.ownerStory) {
    sections.push(`**OWNER/FOUNDER:**
Name: ${storeInfo.ownerName || "Not specified"}
${storeInfo.ownerStory ? `Story: ${storeInfo.ownerStory}` : ""}`);
  }

  // Contact information
  if (storeInfo.contactEmail || storeInfo.contactPhone || storeInfo.address) {
    sections.push(`**CONTACT INFORMATION:**
${storeInfo.contactEmail ? `- Email: ${storeInfo.contactEmail}` : ""}
${storeInfo.contactPhone ? `- Phone: ${storeInfo.contactPhone}` : ""}
${storeInfo.address ? `- Address: ${storeInfo.address}` : ""}
${storeInfo.businessHours ? `- Hours: ${storeInfo.businessHours}` : ""}`);
  }

  // Policies
  if (storeInfo.shippingPolicy || storeInfo.returnPolicy) {
    sections.push(`**STORE POLICIES:**
${storeInfo.shippingPolicy ? `Shipping: ${storeInfo.shippingPolicy}` : ""}
${storeInfo.returnPolicy ? `Returns: ${storeInfo.returnPolicy}` : ""}`);
  }

  // Payment methods
  if (storeInfo.paymentMethods?.length > 0) {
    sections.push(`**ACCEPTED PAYMENT METHODS:**
${storeInfo.paymentMethods.join(", ")}`);
  }

  // Social media
  const socialLinks = [];
  if (storeInfo.socialMedia?.facebook)
    socialLinks.push(`Facebook: ${storeInfo.socialMedia.facebook}`);
  if (storeInfo.socialMedia?.instagram)
    socialLinks.push(`Instagram: ${storeInfo.socialMedia.instagram}`);
  if (storeInfo.socialMedia?.tiktok)
    socialLinks.push(`TikTok: ${storeInfo.socialMedia.tiktok}`);

  if (socialLinks.length > 0) {
    sections.push(`**SOCIAL MEDIA:**
${socialLinks.join("\n")}`);
  }

  // Custom rules
  if (storeInfo.customPromptRules?.length > 0) {
    sections.push(`**SPECIAL INSTRUCTIONS:**
${storeInfo.customPromptRules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}`);
  }

  // Special responses
  if (storeInfo.specialResponses?.length > 0) {
    const specialRules = storeInfo.specialResponses
      .filter((sr) => sr.trigger && sr.response)
      .map(
        (sr) =>
          `- If user asks about "${sr.trigger}", respond with: "${sr.response}"`
      )
      .join("\n");

    if (specialRules) {
      sections.push(`**SPECIAL RESPONSE RULES:**
${specialRules}`);
    }
  }

  return sections.join("\n\n");
};
