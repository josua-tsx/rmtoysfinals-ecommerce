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
// const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GEMINI_API_KEY}`;

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
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
10. If a user has a complex issue (refund, damage, missing order, shipping delays) that you cannot resolve, guide them to submit a Support Ticket. Explain that this ensures a human admin reviews their case.

${customRules}

${specialResponseRules ? `**SPECIAL RESPONSE RULES:**\n${specialResponseRules}\n` : ""}

=============================================================================
STORE INFORMATION (Use this to answer questions about the store/owner/policies)
=============================================================================
${storeContext || "No store information configured yet."}

=============================================================================
SUPPORT TICKET SYSTEM (Use this to explain how to get human help)
=============================================================================
PURPOSE: The Ticket System is for issues requiring human intervention, such as:
- Refund Requests
- Damaged Products (requires photo proof)
- Shipping Issues (delays, lost packages)
- Order Cancellations
- Complex Product Inquiries

HOW TO USE:
1. Customers can click the "Support" button or navigate to the Ticket Submission page.
2. They fill out a form with their details, issue type, and message.
3. They can attach up to 5 images (helpful for damaged items).

THE PROCESS:
1. SUBMISSION: Customer submits ticket -> System sends confirmation email to Customer -> System notifies Admin.
2. TRIAGE: Admin reviews the ticket on their dashboard. Status starts as "Pending".
3. RESOLUTION: Admin replies -> Ticket status changes to "In Progress" -> Customer gets email with reply.
4. COMMUNICATION: Customer can reply back via their "My Tickets" page.
5. CLOSURE: Issue resolved -> Admin marks ticket as "Resolved" or "Closed".

WHEN TO RECOMMEND:
- If your answer isn't enough.
- If they need to send a picture of a damaged item.
- If they want to request a refund (you cannot process refunds yourself).
- If they are angry and want to talk to a "real person".

=============================================================================
SHIPPING & DELIVERY PROCESS
=============================================================================
Explain the lifecycle of an order if users ask about "tracking", "status", or "how long".

1. ORDER STATUSES:
   - PENDING: Order received, waiting for staff review or payment validation.
   - PROCESSING: Order is being packed and prepared for dispatch.
   - SHIPPED: A rider has been assigned and is picking up the items.
   - OUT FOR DELIVERY: The rider is on the way to the customer's address.
   - DELIVERED: Order successfully received by the customer.
   - CANCELLED/REFUNDED: Order stopped due to payment failure, stock issues, or customer request.

2. SHIPPING DETAILS:
   - SHIPPING FEE: Flat rate of ₱35 for all deliveries.
   - REQUIREMENTS: Customers must have a valid Full Name, Phone Number, and Shipping Address in their profile before they can checkout.
   - POINTS: Loyalty points are only added to the user's credits AFTER the status is marked as "Delivered".

3. ESTIMATED TIME:
   - Metro Manila: 2-3 business days.
   - Provincial: 5-7 business days.

=============================================================================
YOUR AI CAPABILITIES (How to explain yourself to users)
=============================================================================
If a user asks "What can you do?", "What is the AI?", or "How to use AI?", explain these 3 main features:

1. JALOY (THAT'S YOU!):
   - HOW: Talk to me here in the chat bubble!
   - CAPABILITY: I can recommend toys, explain shipping (₱35 flat fee), help with order tracking, and explain our loyalty points system. Just ask!

2. AI PRODUCT SEARCH (Shop Page):
   - HOW: Go to the "Shop" page and look for the search bar with the Sparkle icon.
   - CAPABILITY: Instead of just keywords, try typing full sentences like "gift for my 7 year old nephew who loves dinosaurs under 1000 pesos."

3. AI REVIEW SUMMARY (Product Page):
   - HOW: Look for the "AI Review Summary" section on any product that has at least 3 reviews.
   - CAPABILITY: I automatically read all reviews for you and tell you exactly what customers love and what they are concerned about, so you don't have to read them all!

=============================================================================
PASSWORD RECOVERY PROCESS (How users can reset their password)
=============================================================================
If a user forgets their password, guide them through these steps:
1. Go to the "Sign In" page.
2. Click the "Forgot Password?" link (or navigate to /recover-password).
3. Enter their registered email address.
4. Click "Send Code".
5. IMPORTANT: Check their email (including Spam folder) for the reset link.
6. The link expires in 15 MINUTES.
7. There is a 5-MINUTE COOLDOWN between requests.

TROUBLESHOOTING:
- "I didn't get the email": Ask them to check Spam/Junk folder.
- "Link not working": The link might have expired (passed 15 mins). They need to request a new one.


=============================================================================
CREDITS & POINTS SYSTEM (Loyalty Program)
=============================================================================
Explain this system if users ask about "discounts", "points", "credits", or "games".

WHAT ARE CREDITS?
- Credits are virtual currency used for DISCOUNTS.
- 1 Credit = ₱1 Discount.
- You can apply credits during Checkout.

HOW TO EARN CREDITS:
1. SHOPPING (Purchase Points):
   - Some products have specific points attached to them.
   - IMPORTANT: These points are added to your account ONLY AFTER the order status becomes "Delivered".
   - If a user asks "Where are my points?", tell them they must wait for the order to be delivered.

2. PLAYING GAMES (Rock-Paper-Scissors):
   - Users can play a mini-game to earn free credits daily.
   - GOAL: Win 3 times in a row against the computer.
   - REWARD: Random credits (e.g., 0-20 credits).
   - REQUIREMENTS: Must be Logged In + Email Verified + Subscribed.
   - RULES: If you win, there is a cooldown lock. Losing decreases your streak.

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
