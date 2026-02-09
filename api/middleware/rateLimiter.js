import rateLimit from "express-rate-limit";

/**
 * Rate Limiter Middleware Configurations
 *
 * Tiered rate limiting for different types of routes:
 * - authLimiter: Strict limits for login/register (prevent brute force)
 * - apiLimiter: General API rate limiting
 * - strictLimiter: Ultra-strict for sensitive operations
 */

// Strict limiter for auth routes (login, register, password reset)
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 2000, // 1 minute
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: "Too many attempts. Please try again after 2 minutes.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// General API limiter (applied globally)
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ultra-strict limiter for sensitive operations (e.g., password reset email)
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: "Rate limit exceeded. Please try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Guest-only chatbot limiter (skip for authenticated users)
export const guestChatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 messages per day for guests
  skip: (req) => !!req.user, // Skip if user is authenticated
  message: {
    success: false,
    limitReached: true,
    message: "You've reached the free chat limit! Log in for unlimited 24/7 access.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
