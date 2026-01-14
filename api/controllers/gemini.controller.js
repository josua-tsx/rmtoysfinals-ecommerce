import axios from 'axios';
import dotenv from 'dotenv';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Review from '../models/review.model.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`;
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
const GEMINI_VISION_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;


export const generateContent = async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ message: 'Gemini API key not found. Please add it to your .env file.' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required.' });
  }

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: prompt,
        }],
      }],
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Failed to generate content from Gemini API.' });
  }
};

// In-memory cache for dashboard summary
let dashboardSummaryCache = {
  data: null,
  timestamp: null,
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const getDashboardSummary = async (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      message: "Gemini API key not found. Please add it to your .env file.",
    });
  }

  // Check cache
  const now = Date.now();
  if (
    dashboardSummaryCache.data &&
    dashboardSummaryCache.timestamp &&
    now - dashboardSummaryCache.timestamp < CACHE_DURATION
  ) {
    console.log("Returning cached dashboard summary");
    return res.json(dashboardSummaryCache.data);
  }

  try {
    // Fetch sales analytics
    const dailySales = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const yearlySales = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    // Fetch top products by purchases
    const topProductsDaily = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          totalQuantity: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.productName",
          quantity: "$totalQuantity",
        },
      },
    ]);

    const topProductsMonthly = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          totalQuantity: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.productName",
          quantity: "$totalQuantity",
        },
      },
    ]);

    const topProductsYearly = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.productId",
          totalQuantity: { $sum: "$orderItems.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.productName",
          quantity: "$totalQuantity",
        },
      },
    ]);

    // Format data for Gemini
    const todaySales = dailySales[0]?.totalSales || 0;
    const todayOrders = dailySales[0]?.orderCount || 0;
    const currentMonthSales = monthlySales[0]?.totalSales || 0;
    const currentMonthOrders = monthlySales[0]?.orderCount || 0;
    const currentYearSales = yearlySales[0]?.totalSales || 0;
    const currentYearOrders = yearlySales[0]?.orderCount || 0;

    const prompt = `Analyze this e-commerce dashboard data and provide a structured business intelligence summary in JSON format.
    
    Sales Summary:
    - Today: ${todaySales} PHP (${todayOrders} orders)
    - This Month: ${currentMonthSales} PHP (${currentMonthOrders} orders)
    - This Year: ${currentYearSales} PHP (${currentYearOrders} orders)

    Top Products by Purchases:
    Today: ${topProductsDaily.map((p) => `${p.name} (${p.quantity})`).join(", ")}
    Month: ${topProductsMonthly.map((p) => `${p.name} (${p.quantity})`).join(", ")}
    Year: ${topProductsYearly.map((p) => `${p.name} (${p.quantity})`).join(", ")}

    Returns the response in this exact JSON structure:
    {
      "overview": "One clear, professional sentence summarizing the overall performance status.",
      "keyMetrics": [
        { "label": "Metric Name", "value": "Value", "status": "positive|neutral|negative", "insight": "Brief insight" }
      ],
      "trends": "A short paragraph analyzing sales trends (e.g., comparing daily vs monthly pace).",
      "recommendations": [
        "Actionable recommendation 1 (e.g. regarding stock or marketing)",
        "Actionable recommendation 2",
        "Actionable recommendation 3"
      ]
    }
    
    Keep insights professional, actionable, and concise. Ensure valid JSON output only.`;

    // Call Gemini API
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4, // Lower temperature for more consistent JSON
        maxOutputTokens: 1024,
      },
    });

    const aiResponseText = response.data.candidates[0].content.parts[0].text;
    
    // Clean and parse JSON
    const cleanJson = aiResponseText.replace(/```json\n?|```/g, "").trim();
    const aiSummaryData = JSON.parse(cleanJson);

    const responseData = {
      success: true,
      summary: aiSummaryData, // Now a structured object
    };

    // Update cache
    dashboardSummaryCache = {
      data: responseData,
      timestamp: Date.now(),
    };

    res.json(responseData);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error("Gemini API Quota Exceeded:", error.response.data);
      return res.status(429).json({
        message:
          "AI quota exceeded for the free tier. Please try again later or check your billing details.",
        error: error.response.data,
      });
    }

    console.error(
      "Error generating dashboard summary:",
      error.response ? error.response.data : error.message
    );
    next(error);
  }
};

/**
 * =============================================================================
 * AI PRODUCT DESCRIPTION GENERATOR
 * =============================================================================
 * Generates product description and details based on a product name.
 * Used by admins when adding new products.
 */
export const generateProductDescription = async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key not found. Please add it to your .env file.",
    });
  }

  const { productName } = req.body;

  if (!productName || typeof productName !== "string" || productName.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Product name is required and must be at least 3 characters.",
    });
  }

  try {
    // The prompt is carefully crafted to get structured output
    const prompt = `You are an expert e-commerce copywriter for RM Toys, a toy store in the Philippines.

Given the product name: "${productName.trim()}"

Generate the following in JSON format:
{
  "description": "A compelling 1-2 sentence product description (max 200 characters). Make it engaging and highlight key features.",
  "details": [
    { "label": "Brand", "value": "the brand name" },
    { "label": "Age Range", "value": "recommended age range" },
    { "label": "Material", "value": "main material" },
    { "label": "Color", "value": "primary color(s)" },
    { "label": "Dimensions", "value": "approximate size" }
  ]
}

RULES:
- Keep the description under 200 characters
- Provide exactly 5 detail items with label and value
- Use realistic values based on the product name
- If unsure about specifics, use reasonable estimates
- Always include "Color" as one of the details (this is required for filtering). 
- also make sure the value of the color is for example "Red" or "Blue" or "Green" or "Yellow" or "Black" or "White" or "Pink" or "Purple" or "Orange" or "Brown" or "Grey" or "Silver" or "Gold" or "Multi-color" or "Other". be specific and accurate
- Response must be valid JSON only, no markdown or extra text`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,  // Increased to prevent truncation
      },
    });

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate content. Please try again.",
      });
    }

    // Parse the JSON response from AI
    // Remove any markdown code blocks if present
    const cleanedResponse = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedResponse);
      return res.status(500).json({
        success: false,
        message: "AI generated invalid format. Please try again.",
        raw: cleanedResponse,
      });
    }

    res.json({
      success: true,
      description: parsedData.description || "",
      details: parsedData.details || [],
    });
  } catch (error) {
    console.error(
      "Error generating product description:",
      error.response ? error.response.data : error.message
    );

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI quota exceeded. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate product description.",
    });
  }
};

/**
 * =============================================================================
 * AI TICKET REPLY GENERATOR
 * =============================================================================
 * Generates a suggested reply for support tickets based on:
 * 1. Ticket context (issue type, subject, conversation history)
 * 2. Store policies and tone guidelines
 * 3. Customer sentiment analysis
 * 
 * Used by admins to get AI-assisted reply suggestions that they can edit
 * before sending.
 */
export const generateTicketReply = async (req, res) => {
  // ==========================================================================
  // STEP 1: Validate API Key
  // ==========================================================================
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key not found. Please add it to your .env file.",
    });
  }

  // ==========================================================================
  // STEP 2: Extract and Validate Input
  // ==========================================================================
  const { ticketId, subject, issueType, customerName, messages } = req.body;

  if (!ticketId || !subject || !issueType || !messages) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: ticketId, subject, issueType, messages",
    });
  }

  try {
    // ========================================================================
    // STEP 3: Format Conversation History
    // ========================================================================
    // We format the messages into a readable conversation for the AI
    const conversationHistory = messages
      .map((msg, index) => {
        const role = msg.sender === "customer" ? "CUSTOMER" : "SUPPORT";
        const time = new Date(msg.timestamp).toLocaleString();
        return `[${index + 1}] ${role} (${time}):\n${msg.message}`;
      })
      .join("\n\n");

    // ========================================================================
    // STEP 4: Build the AI Prompt
    // ========================================================================
    // The prompt is carefully structured to get consistent, helpful responses
    const prompt = `You are a friendly and professional customer support agent for RM Toys, an online toy store in the Philippines.

=== TICKET INFORMATION ===
Customer Name: ${customerName}
Issue Type: ${issueType}
Subject: ${subject}

=== CONVERSATION HISTORY ===
${conversationHistory}

=== YOUR TASK ===
Generate a helpful, empathetic, and professional reply to the customer's most recent message.

=== GUIDELINES ===
1. TONE: Be warm, friendly, and professional. Use "po" and "salamat" occasionally for Filipino touch.
2. EMPATHY: Acknowledge the customer's concern before offering solutions.
3. ISSUE-SPECIFIC RESPONSES:
   - Refund Request: Express understanding, explain refund process (3-5 business days), ask for order details if needed
   - Shipping Issue: Apologize for delay, offer to track the order, provide estimated delivery
   - Damaged Product: Express sincere apology, offer replacement or refund, ask for photos if not provided
   - Order Cancellation: Confirm if order can still be cancelled, explain process
   - Product Inquiry: Provide helpful information, suggest alternatives if needed
   - Other: Address the specific concern professionally

4. STRUCTURE:
   - Start with greeting using customer's name
   - Acknowledge their concern
   - Provide solution or next steps
   - End with appreciation and offer for further help

5. LENGTH: Keep response concise but complete (2-4 paragraphs)

6. DO NOT:
   - Make promises you can't keep
   - Use overly formal or robotic language
   - Repeat information already given in conversation
   - Include placeholders like [insert X here]

=== GENERATE REPLY NOW ===
Write ONLY the reply message, no additional commentary or markdown formatting.`;

    // ========================================================================
    // STEP 5: Call Gemini API
    // ========================================================================
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7, // Balanced creativity and consistency
        maxOutputTokens: 1024,
      },
    });

    // ========================================================================
    // STEP 6: Extract and Return the Response
    // ========================================================================
    const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiReply) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate reply. Please try again.",
      });
    }

    // Clean up the response - remove any accidental markdown or extra whitespace
    const cleanedReply = aiReply.trim();

    res.json({
      success: true,
      suggestedReply: cleanedReply,
    });

  } catch (error) {
    console.error(
      "Error generating ticket reply:",
      error.response ? error.response.data : error.message
    );

    // Handle quota exceeded error specifically
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI quota exceeded. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate ticket reply.",
    });
  }
};

/**
 * =============================================================================
 * AI PRODUCT SEARCH
 * =============================================================================
 * Natural language product search that understands queries like:
 * - "toys for 5 year old boys"
 * - "under 500 pesos"
 * - "educational games for kids"
 * - "birthday gift for my daughter"
 * 
 * Returns matching products with relevance explanations.
 */
export const searchProductsWithAI = async (req, res) => {
  // ==========================================================================
  // STEP 1: Validate API Key
  // ==========================================================================
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key not found.",
    });
  }

  // ==========================================================================
  // STEP 2: Extract and Validate Input
  // ==========================================================================
  const { query } = req.body;

  if (!query || typeof query !== "string" || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query is required and must be at least 2 characters.",
    });
  }

  try {
    // ========================================================================
    // STEP 3: Fetch Products from Database
    // ========================================================================
    const products = await Product.find({ status: "published" })
      .populate("category", "categoryName")
      .select("productName price productDescription productDetails productImages category sold")
      .lean();

    if (products.length === 0) {
      return res.json({
        success: true,
        products: [],
        message: "No products available.",
      });
    }

    // ========================================================================
    // STEP 4: Format Products for AI Analysis
    // ========================================================================
    const productList = products.map((p, index) => {
      // Extract details like color, age range, etc.
      const details = p.productDetails
        ?.map(d => `${d.label}: ${d.value}`)
        .join(", ") || "";
      
      return `[${index}] "${p.productName}" - ₱${p.price} | Category: ${p.category?.categoryName || "Uncategorized"} | ${details} | Sold: ${p.sold || 0}`;
    }).join("\n");

    // ========================================================================
    // STEP 5: Build the AI Prompt
    // ========================================================================
    const prompt = `You are a product search assistant for RM Toys, an online toy store in the Philippines.

=== USER SEARCH QUERY ===
"${query.trim()}"

=== AVAILABLE PRODUCTS ===
${productList}

=== YOUR TASK ===
Analyze the user's search query and find the most relevant products from the list above.

=== INSTRUCTIONS ===
1. Understand the user's INTENT (age group, price range, product type, occasion, etc.)
2. Match products that fit the criteria
3. Return a JSON array of matching product indices with relevance scores

=== RESPONSE FORMAT ===
Return ONLY valid JSON, no markdown or extra text:
{
  "matches": [
    { "index": 0, "score": 95, "reason": "Brief reason why this matches" },
    { "index": 3, "score": 80, "reason": "Brief reason why this matches" }
  ],
  "interpretation": "What the AI understood from the query"
}

=== RULES ===
- Return maximum 10 matches, ordered by relevance score (highest first)
- Score range: 0-100 (100 = perfect match)
- Only include products with score >= 50
- If no products match, return empty matches array
- Keep reasons short (under 50 characters)
- If query mentions price (e.g., "under 500"), filter by price
- If query mentions age, match products with appropriate age ranges
- Consider product names, descriptions, and details

=== GENERATE RESPONSE ===`;

    // ========================================================================
    // STEP 6: Call Gemini API
    // ========================================================================
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent results
        maxOutputTokens: 1024,
      },
    });

    // ========================================================================
    // STEP 7: Parse and Process AI Response
    // ========================================================================
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message: "Failed to process search. Please try again.",
      });
    }

    // Clean and parse JSON response
    const cleanedResponse = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedResponse);
      // Fallback: return empty results
      return res.json({
        success: true,
        products: [],
        interpretation: "Could not understand the search query. Try being more specific.",
      });
    }

    // ========================================================================
    // STEP 8: Map AI Results to Actual Products
    // ========================================================================
    const matchedProducts = (parsedResult.matches || [])
      .filter(match => match.index >= 0 && match.index < products.length)
      .map(match => ({
        ...products[match.index],
        relevanceScore: match.score,
        matchReason: match.reason,
      }));

    res.json({
      success: true,
      products: matchedProducts,
      interpretation: parsedResult.interpretation || "AI-powered search results",
      totalMatches: matchedProducts.length,
    });

  } catch (error) {
    console.error(
      "Error in AI product search:",
      error.response ? error.response.data : error.message
    );

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI search is temporarily unavailable. Please use regular search.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Search failed. Please try again.",
    });
  }
};

/**
 * =============================================================================
 * AI REVIEW SUMMARIZATION
 * =============================================================================
 * Analyzes customer reviews for a product and generates:
 * - Overall sentiment (positive/mixed/negative)
 * - Key pros (what customers love)
 * - Key cons (common complaints)
 * - Key themes mentioned
 * - One-line summary
 * 
 * Only works for products with 3+ reviews for meaningful analysis.
 */
export const summarizeProductReviews = async (req, res) => {
  // ==========================================================================
  // STEP 1: Validate API Key
  // ==========================================================================
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key not found.",
    });
  }

  // ==========================================================================
  // STEP 2: Get Product ID and Fetch Reviews
  // ==========================================================================
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required.",
    });
  }

  try {
    // Fetch reviews for this product
    const reviews = await Review.find({ productId })
      .populate("userId", "username")
      .lean();

    // Need minimum 3 reviews for meaningful summary
    if (reviews.length < 3) {
      return res.json({
        success: true,
        hasEnoughReviews: false,
        message: "Not enough reviews to generate summary. Need at least 3 reviews.",
        reviewCount: reviews.length,
      });
    }

    // ========================================================================
    // STEP 3: Format Reviews for AI Analysis
    // ========================================================================
    const reviewList = reviews.map((r, index) => {
      const stars = "⭐".repeat(r.rating);
      const comment = r.commentReview || "(No comment)";
      return `[${index + 1}] ${stars} (${r.rating}/5) - "${comment}"`;
    }).join("\n");

    // Calculate average rating
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

    // ========================================================================
    // STEP 4: Build the AI Prompt
    // ========================================================================
    const prompt = `You are a review analyst for RM Toys, an online toy store in the Philippines.

=== PRODUCT REVIEWS (${reviews.length} total, ${avgRating} avg rating) ===
${reviewList}

=== YOUR TASK ===
Analyze these customer reviews and provide a structured summary.

=== RESPONSE FORMAT ===
Return ONLY valid JSON, no markdown or extra text:
{
  "summary": "One sentence summarizing overall customer sentiment (max 100 chars)",
  "sentiment": "positive" | "mixed" | "negative",
  "pros": ["Pro 1", "Pro 2", "Pro 3"],
  "cons": ["Con 1", "Con 2"],
  "themes": ["Theme 1", "Theme 2", "Theme 3"]
}

=== RULES ===
1. Summary should be conversational, like "Customers love the quality but wish shipping was faster"
2. Sentiment: "positive" if avg > 3.5, "mixed" if 2.5-3.5, "negative" if < 2.5
3. Extract 2-4 pros (things customers praise)
4. Extract 1-3 cons (common complaints) - can be empty if reviews are all positive
5. Extract 2-4 key themes mentioned (like "quality", "value", "durability", "fun")
6. Keep all items short (under 30 characters each)
7. Use Filipino-friendly language when appropriate ("sulit", "maganda")
8. If no clear cons, use empty array []

=== GENERATE RESPONSE ===`;

    // ========================================================================
    // STEP 5: Call Gemini API
    // ========================================================================
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4, // Lower for consistent summaries
        maxOutputTokens: 512,
      },
    });

    // ========================================================================
    // STEP 6: Parse and Return Response
    // ========================================================================
    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate summary.",
      });
    }

    // Clean and parse JSON
    const cleanedResponse = aiResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedResponse);
      return res.status(500).json({
        success: false,
        message: "Failed to parse summary.",
      });
    }

    res.json({
      success: true,
      hasEnoughReviews: true,
      reviewCount: reviews.length,
      averageRating: parseFloat(avgRating),
      ...parsedResult,
    });

  } catch (error) {
    console.error(
      "Error in review summarization:",
      error.response ? error.response.data : error.message
    );

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message: "AI quota exceeded. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to summarize reviews.",
    });
  }
};

