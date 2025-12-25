import axios from 'axios';
import dotenv from 'dotenv';
import Order from '../models/order.model.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`;

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

    const prompt = `Analyze this e-commerce dashboard data and provide a concise business summary.

      Sales Summary:
      - Today: ${todaySales} PHP (${todayOrders} orders)
      - This Month: ${currentMonthSales} PHP (${currentMonthOrders} orders)
      - This Year: ${currentYearSales} PHP (${currentYearOrders} orders)

      Top Products by Purchases:

      Today's Top Products:
      ${
        topProductsDaily.length > 0
          ? topProductsDaily
              .map((p, i) => `${i + 1}. ${p.name} - ${p.quantity} units`)
              .join("\n")
          : "No sales today"
      }

      This Month's Top Products:
      ${
        topProductsMonthly.length > 0
          ? topProductsMonthly
              .map((p, i) => `${i + 1}. ${p.name} - ${p.quantity} units`)
              .join("\n")
          : "No sales this month"
      }

      This Year's Top Products:
      ${
        topProductsYearly.length > 0
          ? topProductsYearly
              .map((p, i) => `${i + 1}. ${p.name} - ${p.quantity} units`)
              .join("\n")
          : "No sales this year"
      }
`;

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
    });

    const aiSummary = response.data.candidates[0].content.parts[0].text;

    const responseData = {
      success: true,
      summary: aiSummary,
      data: {
        sales: {
          today: todaySales,
          month: currentMonthSales,
          year: currentYearSales,
        },
        topProducts: {
          daily: topProductsDaily,
          monthly: topProductsMonthly,
          yearly: topProductsYearly,
        },
      },
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
