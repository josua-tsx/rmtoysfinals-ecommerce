import axios from "axios";
import dotenv from "dotenv";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Faqs from "../models/faqs.model.js";
import StoreInfo from "../models/storeInfo.model.js";
import { formatStoreInfoForAI } from "./storeInfo.controller.js";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using gemini-2.0-flash as per your preference, change if needed
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`;

/**
 * =============================================================================
 * SYSTEM PROMPT - THE "RULES" FOR THE AI
 * =============================================================================
 * This is where you define WHO the AI is and WHAT it can/cannot do.
 * The AI will follow these instructions for every conversation.
 */
/**
 * =============================================================================
 * buildSystemPrompt - Creates the AI's "brain" with all context
 * =============================================================================
 * 
 * AI ENGINEERING CONCEPT: "System Prompt Architecture"
 * -----------------------------------------------------
 * The system prompt is the most important part of your AI application.
 * It defines:
 * 1. WHO the AI is (persona)
 * 2. WHAT it can do (capabilities)
 * 3. WHAT it cannot do (restrictions)
 * 4. WHAT it knows (context/knowledge)
 * 
 * Structure matters! We organize information in sections so the AI
 * can easily find and use relevant information.
 */
const buildSystemPrompt = (products, categories, faqs, storeInfo) => {
  // Format products for the prompt
  const productList = products
    .map(
      (p) =>
        `- ${p.productName}: ₱${p.price} - ${p.productDescription?.substring(0, 100)}...`
    )
    .join("\n");

  // Format categories for the prompt
  const categoryList = categories
    .map((c) => `- ${c.categoryName}: ${c.categoryDescription}`)
    .join("\n");

  // Format FAQs for the prompt
  const faqList = faqs.map((f) => `Q: ${f.title}\nA: ${f.answer}`).join("\n\n");

  // Format store info using our helper function
  const storeContext = storeInfo ? formatStoreInfoForAI(storeInfo) : "";

  // Extract custom rules if any
  const customRules = storeInfo?.customPromptRules?.length > 0
    ? storeInfo.customPromptRules.map((rule, i) => `${i + 9}. ${rule}`).join("\n")
    : "";

  // Extract special responses if any
  const specialResponseRules = storeInfo?.specialResponses?.length > 0
    ? storeInfo.specialResponses
        .filter(sr => sr.trigger && sr.response)
        .map(sr => `- If user mentions "${sr.trigger}", respond: "${sr.response}"`)
        .join("\n")
    : "";

  return `You are "RM Toys Assistant", a friendly and helpful AI chatbot for RM Toys, an online toy store in the Philippines. you also have a specific name which is Jaloy.

**YOUR ROLE:**
- Help customers find products, answer questions about orders, shipping, returns, and store policies.
- Be friendly, helpful, and concise.
- Use the product, category, FAQ, and store information provided below to give accurate answers.
- When asked about the store, owner, or policies, use the STORE INFORMATION section.

**STRICT RULES (VERY IMPORTANT):**
1. You can ONLY discuss topics related to RM Toys, its products, ordering, shipping, payments, returns, and account issues.
2. If a user asks about something NOT related to the shop (e.g., weather, news, coding, personal advice, other stores), you MUST politely decline by saying something like: "I'm sorry, I can only help with questions about RM Toys and our products. Is there anything else I can help you with regarding your shopping experience?"
3. Do NOT make up information about products. If you don't have information about a specific product, say so.
4. Keep responses concise and easy to read.
5. Use Philippine Peso (₱) for prices.
6. When asked about the owner, founder, or who runs the store, refer to the STORE INFORMATION section.
7. When asked about store policies (shipping, returns, payments), use the information from STORE INFORMATION.
8. If asked about contact details or business hours, provide information from STORE INFORMATION.
9. if user asked about the list of products names, show the current list of products names, format: here are the list of products. count the products. 
${customRules}

${specialResponseRules ? `**SPECIAL RESPONSE RULES:**\n${specialResponseRules}\n` : ""}

=============================================================================
STORE INFORMATION (Use this to answer questions about the store/owner/policies)
=============================================================================
${storeContext || "No store information configured yet."}

=============================================================================
PRODUCT CATALOG (Top 20 Products)
=============================================================================
${productList || "No products available at the moment."}

=============================================================================
PRODUCT CATEGORIES
=============================================================================
${categoryList || "No categories available."}

=============================================================================
FREQUENTLY ASKED QUESTIONS
=============================================================================
${faqList || "No FAQs available."}

**EXAMPLE INTERACTIONS:**
User: "Do you have Lego?"
You: "Yes! We have several Lego sets available. [List relevant products from catalog]. Would you like more details about any of them?"

User: "What's the weather today?"
You: "I'm sorry, I can only help with questions about RM Toys and our products. Is there anything else I can help you with regarding your shopping experience?"

User: "Who owns this store?"
You: "[Use owner information from STORE INFORMATION section]"

User: "How do I track my order?"
You: "You can track your order by logging into your account and going to the 'Order History' section. If you need further assistance, please have your order number ready!"

Now, respond to the user's message based on these instructions.`;
};

/**
 * =============================================================================
 * CHAT HANDLER - Main endpoint for chat messages
 * =============================================================================
 */
export const handleChat = async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key not found. Please configure it in .env",
    });
  }

  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Message is required and must be a non-empty string.",
    });
  }

  try {
    // ==========================================================================
    // STEP 1: Fetch ALL context from database
    // ==========================================================================
    // AI ENGINEERING CONCEPT: "Context Injection"
    // -------------------------------------------
    // We fetch real data from multiple sources to give the AI comprehensive
    // knowledge. The more relevant context, the better the responses!
    // 
    // Sources we're injecting:
    // 1. Products - What the store sells
    // 2. Categories - How products are organized
    // 3. FAQs - Common questions and answers
    // 4. StoreInfo - Owner, policies, contact info (NEW!)
    const [products, categories, faqs, storeInfo] = await Promise.all([
      Product.find({ status: "published" })
        .select("productName price productDescription")
        .limit(20)
        .lean(),
      Category.find().select("categoryName categoryDescription").lean(),
      Faqs.find().select("title answer").lean(),
      StoreInfo.findOne().lean(), // NEW: Fetch store configuration
    ]);

    // ==========================================================================
    // STEP 2: Build the system prompt with ALL fetched data
    // ==========================================================================
    // The system prompt now includes store info for comprehensive responses
    const systemPrompt = buildSystemPrompt(products, categories, faqs, storeInfo);

    // ==========================================================================
    // STEP 3: Build the message history for Gemma
    // ==========================================================================
    // IMPORTANT: Gemma doesn't support systemInstruction, so we embed the
    // system prompt as the first messages in the conversation.
    // This is called "prompt injection" - a workaround for models without
    // native system instruction support.
    
    // Check if this is a fresh conversation (no history with system prompt yet)
    const hasSystemContext = history.length > 0 && 
      history[0]?.parts?.[0]?.text?.includes("RM Toys Assistant");
    
    const contents = hasSystemContext
      ? [
          // Use existing history (already has system context)
          ...history,
          // Current user message
          {
            role: "user",
            parts: [{ text: message }],
          },
        ]
      : [
          // NEW CONVERSATION: Inject system prompt as first messages
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "Understood! I am RM Toys Assistant, ready to help customers with their shopping needs. I'll follow all the guidelines you've provided. How can I assist you today?" }],
          },
          // Then any previous messages
          ...history,
          // Current user message
          {
            role: "user",
            parts: [{ text: message }],
          },
        ];

    // ==========================================================================
    // STEP 4: Call Gemma API
    // ==========================================================================
    // NOTE: Gemma doesn't support systemInstruction, so we removed it.
    // The system prompt is now embedded in the conversation history above.
    const response = await axios.post(GEMINI_API_URL, {
      contents: contents,
      // Generation config for better responses
      generationConfig: {
        temperature: 0.7, // Lower = more focused, Higher = more creative
        maxOutputTokens: 500, // Keep responses concise
      },
    });

    // ==========================================================================
    // STEP 5: Extract and return the AI's response
    // ==========================================================================
    const aiReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't process that. Please try again.";

    res.json({
      success: true,
      reply: aiReply,
      // Return the updated history so frontend can track conversation
      updatedHistory: [
        ...contents,
        {
          role: "model",
          parts: [{ text: aiReply }],
        },
      ],
    });
  } catch (error) {
    console.error(
      "Chatbot Error:",
      error.response ? error.response.data : error.message
    );

    // Handle specific error codes
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "I'm getting a lot of questions right now! Please try again in a moment.",
      });
    }

    if (error.response?.status === 404) {
      return res.status(500).json({
        success: false,
        message:
          "The AI model is temporarily unavailable. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};
