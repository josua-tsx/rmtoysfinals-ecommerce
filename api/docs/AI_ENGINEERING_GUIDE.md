# 🧠 AI Engineering Guide: Context Management for Chatbots

> **A practical guide for aspiring AI Engineers** - Learn how to think about, design, and implement intelligent chatbots through real-world examples from the RM Toys chatbot implementation.

---

## 📚 Table of Contents

1. [What is AI Engineering?](#what-is-ai-engineering)
2. [The Most Important Concept: Context](#the-most-important-concept-context)
3. [System Prompt Architecture](#system-prompt-architecture)
4. [Context Injection Patterns](#context-injection-patterns)
5. [Practical Implementation](#practical-implementation-rm-toys-example)
6. [ML Pipelines vs LLM Integrations](#ml-pipelines-vs-llm-integrations)
7. [Advanced Techniques](#advanced-techniques)
8. [Common Mistakes & How to Avoid Them](#common-mistakes--how-to-avoid-them)
9. [Next Steps: Becoming an AI Engineer](#next-steps-becoming-an-ai-engineer)

---

## What is AI Engineering?

**AI Engineering** is the discipline of building applications that leverage AI models (like Gemini, GPT, Claude) effectively. Unlike traditional programming where you write explicit rules, AI engineering is about:

1. **Communicating with AI** - Telling the AI what you want it to do
2. **Providing Context** - Giving the AI the information it needs
3. **Constraining Behavior** - Setting boundaries on what the AI can/cannot do
4. **Orchestrating Data Flow** - Connecting your app's data to the AI

### The AI Engineering Mindset

```
Traditional Programming:
"Write exactly what the computer should do step by step"

AI Engineering:
"Tell the AI WHO it is, WHAT it knows, and HOW it should behave"
```

Think of it like hiring an employee:
- You don't tell them every keystroke to make
- You tell them their role, give them training materials, and set expectations
- The AI is your new employee - context is their training!

---

## The Most Important Concept: Context

### What is Context?

**Context** is all the information you provide to the AI so it can give relevant, accurate responses. Without context, the AI is just guessing.

```
Without Context:
User: "Do you have Lego?"
AI: "I don't know what store you're asking about..." ❌

With Context:
User: "Do you have Lego?"
AI: "Yes! We have 5 Lego sets in stock at RM Toys. Would you like to see them?" ✅
```

### Types of Context

| Type | Description | Example |
|------|-------------|---------|
| **System Context** | Who the AI is, its role and rules | "You are RM Toys Assistant..." |
| **Knowledge Context** | Facts and data the AI should know | Products, policies, FAQs |
| **Conversation Context** | Previous messages in the chat | Chat history |
| **User Context** | Information about the current user | Name, order history (if available) |

### The Context Hierarchy

```
┌─────────────────────────────────────────────┐
│           SYSTEM PROMPT (Always present)     │
│  - Persona (who the AI is)                   │
│  - Rules (what it can/cannot do)             │
│  - Behavior guidelines                       │
├─────────────────────────────────────────────┤
│           KNOWLEDGE BASE (Injected)          │
│  - Products, Categories, FAQs                │
│  - Store info, policies                      │
│  - Custom rules                              │
├─────────────────────────────────────────────┤
│           CONVERSATION HISTORY               │
│  - Previous user messages                    │
│  - Previous AI responses                     │
├─────────────────────────────────────────────┤
│           CURRENT MESSAGE                    │
│  - What the user just said                   │
└─────────────────────────────────────────────┘
```

---

## System Prompt Architecture

The **system prompt** is the most critical part of your AI application. It's like the AI's "brain configuration."

### Anatomy of a Good System Prompt

```javascript
const systemPrompt = `
// 1. PERSONA - Who is the AI?
You are "RM Toys Assistant", a friendly and helpful AI chatbot...

// 2. ROLE - What does it do?
**YOUR ROLE:**
- Help customers find products
- Answer questions about orders, shipping, returns

// 3. RULES - What can't it do?
**STRICT RULES:**
1. You can ONLY discuss topics related to RM Toys
2. Do NOT make up information

// 4. KNOWLEDGE - What does it know?
**STORE INFORMATION:**
Owner: [Name]
Policies: [Shipping, returns, etc.]

**PRODUCTS:**
[List of products...]

// 5. EXAMPLES - How should it respond?
**EXAMPLE INTERACTIONS:**
User: "Do you have Lego?"
You: "Yes! We have several Lego sets..."
`;
```

### The CRISPE Framework

A popular framework for structuring system prompts:

| Letter | Meaning | Example |
|--------|---------|---------|
| **C** | Capacity | "You are a customer service AI assistant" |
| **R** | Role | "Help customers with shopping, orders, and questions" |
| **I** | Insight | "Use the product catalog and store policies provided" |
| **S** | Statement | "Only discuss RM Toys topics" |
| **P** | Personality | "Be friendly, helpful, and concise" |
| **E** | Experiment | "If unsure, ask clarifying questions" |

---

## Context Injection Patterns

### Pattern 1: Static Context (Hardcoded)

```javascript
// ❌ Not recommended - hard to update
const systemPrompt = `
Owner: Juan Dela Cruz
Phone: +63 XXX XXX XXXX
...
`;
```

**When to use:** Never changes, truly static info

### Pattern 2: Database-Driven Context (What we implemented!)

```javascript
// ✅ Recommended - Dynamic and admin-editable
const storeInfo = await StoreInfo.findOne().lean();
const systemPrompt = buildSystemPrompt(products, categories, faqs, storeInfo);
```

**Benefits:**
- Admins can update without code changes
- AI always has latest information
- Easy to A/B test different contexts

### Pattern 3: Real-time Context

```javascript
// Inject user-specific data
const userOrders = await Order.find({ userId: user.id }).lean();
const systemPrompt = `
...
**USER'S RECENT ORDERS:**
${formatOrders(userOrders)}
`;
```

**When to use:** Personalized responses needed

### Pattern 4: RAG (Retrieval-Augmented Generation)

```javascript
// Advanced: Search for relevant context
const relevantDocs = await vectorSearch(userMessage);
const systemPrompt = `
...
**RELEVANT INFORMATION:**
${relevantDocs.map(d => d.content).join('\n')}
`;
```

**When to use:** Large knowledge bases where you can't include everything

---

## Practical Implementation: RM Toys Example

### What We Built

```
┌──────────────────────────────────────────────────────────────┐
│                     RM TOYS CHATBOT                          │
├──────────────────────────────────────────────────────────────┤
│  CONTEXT SOURCES:                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Products   │  │  Categories │  │    FAQs     │           │
│  │  (DB fetch) │  │  (DB fetch) │  │  (DB fetch) │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│         │               │               │                    │
│  ┌─────────────────────────────────────────────────┐         │
│  │              StoreInfo (NEW!)                    │         │
│  │  - Owner name & story                            │         │
│  │  - Contact info                                  │         │
│  │  - Policies (shipping, returns)                  │         │
│  │  - Custom AI rules                               │         │
│  │  - Special responses                             │         │
│  └─────────────────────────────────────────────────┘         │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────┐         │
│  │           buildSystemPrompt()                    │         │
│  │   Combines all context into structured prompt    │         │
│  └─────────────────────────────────────────────────┘         │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────┐         │
│  │              Gemini API Call                     │         │
│  └─────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `models/storeInfo.model.js` | Schema for store configuration |
| `controllers/storeInfo.controller.js` | CRUD + AI formatting |
| `controllers/chatbot.controller.js` | Orchestrates context injection |

### How to Use

1. **Add store info via API:**
```bash
PUT /api/store-info
{
  "ownerName": "Juan Dela Cruz",
  "ownerStory": "Founded RM Toys in 2020 with a passion for bringing joy to children...",
  "shippingPolicy": "Free shipping for orders over ₱1,500",
  "returnPolicy": "7-day returns with receipt",
  "customPromptRules": [
    "Always mention our loyalty program for orders over ₱2,000"
  ],
  "specialResponses": [
    {
      "trigger": "pinaka magandang babae",
      "response": "That would be Girlie Marie! 💕"
    }
  ]
}
```

2. **Chat with the bot:**
```bash
POST /api/chatbot/chat
{
  "message": "Who owns this store?"
}

# Response will use the configured owner information!
```

---

## ML Pipelines vs LLM Integrations

Two core concepts in AI Engineering that you'll hear about constantly. Let's break them down:

### 🔄 What are ML Pipelines?

**ML Pipelines** are automated workflows that take raw data through multiple stages to produce trained machine learning models.

Think of it like a **factory assembly line**:

```
Raw Data → Clean → Transform → Train → Evaluate → Deploy → Monitor
    ↓         ↓         ↓         ↓        ↓         ↓        ↓
  CSV/DB    Remove    Feature   Build    Test      API      Track
            nulls   engineering model   accuracy  endpoint  drift
```

#### Traditional ML Pipeline Example:

```javascript
// Conceptual ML Pipeline for Product Recommendation
const mlPipeline = {
  step1_ingest: "Collect purchase history from database",
  step2_clean: "Remove incomplete orders, handle nulls",
  step3_features: "Create features: purchase frequency, category preferences",
  step4_train: "Train recommendation model",
  step5_evaluate: "Test accuracy on holdout data",
  step6_deploy: "Deploy as '/api/recommendations' endpoint",
  step7_monitor: "Track click-through rates, retrain monthly"
};
```

#### When You'd Use ML Pipelines:

| Use Case | Example |
|----------|---------|
| Predictions | "Will this customer churn?" |
| Classifications | "Is this review positive or negative?" |
| Recommendations | "Products this user might like" |
| Anomaly Detection | "Is this transaction fraudulent?" |

---

### 🤖 What are LLM Integrations?

**LLM Integrations** are how you connect Large Language Models (Gemini, GPT, Claude) into your applications.

**Good news: You're already doing this!** Your chatbot IS an LLM integration:

```javascript
// This is LLM Integration - what you built!
const response = await axios.post(GEMINI_API_URL, {
  systemInstruction: { parts: [{ text: systemPrompt }] },
  contents: contents,
  generationConfig: { temperature: 0.7 }
});
```

#### Types of LLM Integrations (Progressive Complexity):

```
Level 1: Basic Chat
└── Send message, get response
└── YOUR CHATBOT IS HERE! ✅

Level 2: Context Injection  
└── Add knowledge to prompts (products, FAQs, store info)
└── YOU JUST IMPLEMENTED THIS! ✅

Level 3: Function Calling / Tools
└── LLM can trigger your code
└── "Search for products", "Create order"

Level 4: RAG (Retrieval-Augmented Generation)
└── Vector search + LLM
└── Search huge knowledge bases

Level 5: Agents
└── LLM plans & executes multi-step tasks
└── Autonomous workflows
```

#### LLM Integration Examples:

```javascript
// LEVEL 1: Basic Chat (Simple)
const response = await gemini.generate("What's 2+2?");

// LEVEL 2: Context Injection (What you have!)
const response = await gemini.generate({
  systemPrompt: buildSystemPrompt(products, storeInfo),
  message: userMessage
});

// LEVEL 3: Function Calling (Next level!)
const response = await gemini.generate({
  prompt: userMessage,
  tools: [
    {
      name: "search_products",
      description: "Search products in the database",
      parameters: { query: "string" },
      execute: async (params) => {
        return await Product.find({ 
          productName: { $regex: params.query, $options: 'i' } 
        });
      }
    },
    {
      name: "get_order_status",
      description: "Get status of an order by ID",
      parameters: { orderId: "string" },
      execute: async (params) => {
        return await Order.findById(params.orderId);
      }
    }
  ]
});
// Now the AI can CALL these functions when needed!

// LEVEL 4: RAG (For large knowledge bases)
const relevantDocs = await vectorDB.search(userMessage, { limit: 5 });
const response = await gemini.generate({
  systemPrompt: `Use these docs: ${relevantDocs.join('\n')}`,
  message: userMessage
});

// LEVEL 5: Agents (Autonomous AI)
const agent = new Agent({
  llm: gemini,
  tools: [searchProducts, createOrder, sendEmail, processPayment],
  memory: conversationHistory,
  goal: "Help user complete their purchase"
});
await agent.run(userMessage);
// Agent decides what tools to use and in what order!
```

---

### 🎯 Key Differences: ML Pipelines vs LLM Integration

| Aspect | ML Pipelines | LLM Integration |
|--------|--------------|-----------------|
| **Purpose** | Train custom models for specific predictions | Use pre-trained models for language tasks |
| **Training** | You train the model | Model is pre-trained |
| **Data Needs** | Lots of labeled data | Works out of the box |
| **Time to Build** | Weeks/months | Hours/days |
| **Customization** | Highly specialized | General purpose |
| **Examples** | Fraud detection, recommendations | Chatbots, content generation |
| **Cost Model** | Compute for training | Pay per API call |

### 🔀 When They Work Together

Modern AI applications often combine both:

```
┌─────────────────────────────────────────────────────────────┐
│                    HYBRID AI SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Message: "Show me toys under ₱500"                    │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │          LLM (Gemini/GPT)               │                │
│  │  Understands intent: "filter by price"  │                │
│  └─────────────────────────────────────────┘                │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │      ML Model (Recommendation)          │                │
│  │  Ranks products by user preferences     │                │
│  └─────────────────────────────────────────┘                │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────┐                │
│  │          LLM (Gemini/GPT)               │                │
│  │  Formats friendly response              │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
│  "Here are some great toys under ₱500 that I think         │
│   you'll love based on your previous purchases! 🎁"         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 📍 Where You Are Now

```
Your RM Toys Chatbot:

✅ Level 1: Basic Chat - Complete
✅ Level 2: Context Injection - Complete (with StoreInfo!)
🔜 Level 3: Function Calling - Next step!
🔜 Level 4: RAG - For when you have 1000s of products
🔜 Level 5: Agents - Autonomous order processing
```

**Your next growth opportunity:** Implement **Function Calling** so the AI can:
- Search products dynamically based on user queries
- Check order status in real-time
- Look up specific product details

---

## Advanced Techniques

### 1. Context Windowing

When context is too large, prioritize what's most relevant:

```javascript
// Instead of sending ALL products
const relevantProducts = products
  .filter(p => p.productName.toLowerCase().includes(searchTerm))
  .slice(0, 10);
```

### 2. Dynamic Rules

Add rules based on current state:

```javascript
const dynamicRules = [];

if (isHolidaySeason()) {
  dynamicRules.push("Mention our holiday sale - 15% off all orders!");
}

if (lowStockProducts.length > 0) {
  dynamicRules.push(`Warn customers that these items are low in stock: ${lowStockProducts.join(', ')}`);
}
```

### 3. Context Caching

Don't fetch the same data repeatedly:

```javascript
// Use Redis or in-memory cache
const storeInfo = await cache.getOrSet('storeInfo', async () => {
  return await StoreInfo.findOne().lean();
}, { ttl: 60 * 5 }); // 5 minute cache
```

### 4. Token Optimization

AI models have token limits. Be efficient:

```javascript
// ❌ Wasteful
`Product: Super Amazing Incredible Fantastic Lego Set for Kids Ages 5-12 Years Old
Price: ₱2,500.00
Description: This is a really long description that goes on and on...`

// ✅ Efficient
`- Lego Set (5-12 yrs): ₱2,500 - Building blocks, 500+ pieces`
```

---

## Common Mistakes & How to Avoid Them

### ❌ Mistake 1: Vague System Prompts

```javascript
// Bad
"You are a helpful assistant"

// Good
"You are 'RM Toys Assistant', a customer service AI for RM Toys, 
an online toy store in the Philippines. You help customers find products,
answer questions about orders, and provide store information."
```

### ❌ Mistake 2: No Boundaries

```javascript
// Bad - AI will answer anything
"Help the user with whatever they ask"

// Good - Clear scope
"You can ONLY discuss topics related to RM Toys. 
If asked about unrelated topics, politely redirect."
```

### ❌ Mistake 3: Hardcoding Everything

```javascript
// Bad - Requires code change to update
const owner = "Juan Dela Cruz";

// Good - Database driven
const storeInfo = await StoreInfo.findOne();
const owner = storeInfo.ownerName;
```

### ❌ Mistake 4: Ignoring Conversation History

```javascript
// Bad - Each message is isolated
const response = await ai.generate(currentMessage);

// Good - Include history for context
const response = await ai.generate({
  history: previousMessages,
  message: currentMessage
});
```

---

## Next Steps: Becoming an AI Engineer

### Learning Path

```
Level 1: Prompt Engineering
├── Write clear system prompts
├── Understand context importance
└── Basic API integration

Level 2: Context Engineering
├── Database-driven context
├── Dynamic context injection
├── Token optimization
└── Caching strategies

Level 3: Advanced Patterns
├── RAG (Retrieval-Augmented Generation)
├── Multi-agent systems
├── Function calling / Tool use
└── Fine-tuning basics

Level 4: Production Systems
├── Monitoring & observability
├── Cost optimization
├── Safety & guardrails
└── Evaluation & testing
```

### Resources to Learn More

1. **Prompt Engineering**
   - [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
   - [Google's Prompt Design Guide](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/prompt-design)

2. **RAG & Embeddings**
   - Learn about vector databases (Pinecone, Weaviate)
   - Understand embeddings and semantic search

3. **Practice Projects**
   - Build a customer service bot (like we did!)
   - Create a documentation Q&A bot
   - Build a code review assistant

### The AI Engineer's Mindset

1. **Think in Context** - "What information does the AI need?"
2. **Be Explicit** - AI doesn't assume, tell it everything
3. **Iterate Constantly** - Test, refine, test again
4. **Measure Results** - Track what works and what doesn't
5. **Stay Current** - The field changes weekly!

---

## Quick Reference Card

### System Prompt Checklist

- [ ] Clear persona defined
- [ ] Specific role and capabilities listed
- [ ] Explicit rules and restrictions
- [ ] Relevant knowledge injected
- [ ] Example interactions provided
- [ ] Response format guidelines (if needed)

### Context Injection Checklist

- [ ] Fetch data efficiently (parallel queries)
- [ ] Format data clearly for AI consumption
- [ ] Use sections with headers
- [ ] Prioritize most important context
- [ ] Consider token limits
- [ ] Cache when appropriate

---

## Summary

**The key insight of AI Engineering:** You're not writing code to do things - you're writing instructions for an AI that will do things. The better your instructions (context), the better the AI's performance.

What we implemented in RM Toys:
1. **StoreInfo Model** - Configurable knowledge base
2. **Context Injection** - Dynamic prompt building
3. **Structured System Prompt** - Clear AI instructions
4. **Admin-Editable Rules** - Flexible AI behavior

You're now on your way to thinking like an AI Engineer! 🚀

---

*Written for the RM Toys project - December 2024*
