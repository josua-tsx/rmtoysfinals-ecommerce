import express from "express";
import {
  optionalAuth,
  requireAdmin,
  requireAuth,
} from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validateResource.js";
import {
  createTicketSchema,
  replyTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema
} from "../schema/ticket.schema.js";
import {
  createTicket,
  getAllTickets,
  getUserTickets,
  getSingleTicket,
  updateTicketStatus,
  addReplyToTicket,
  customerReplyToTicket,
  assignTicket,
  deleteTicket,
  getTicketStats,
} from "../controllers/ticket.controller.js";

const router = express.Router();

// Admin routes (must be before /:ticketId to avoid conflicts)
router.get("/", requireAuth, requireAdmin, getAllTickets);
router.get("/stats/overview", requireAuth, requireAdmin, getTicketStats);

// Public routes
router.post("/create", optionalAuth, validateResource(createTicketSchema), createTicket);
router.get("/user/:email", getUserTickets); // For guests to check by email

// Authenticated routes
router.get("/user", requireAuth, getUserTickets);
router.get("/:ticketId", optionalAuth, getSingleTicket);
router.post("/:ticketId/customer-reply", requireAuth, validateResource(replyTicketSchema), customerReplyToTicket);

// Admin routes (with params)
router.put("/:ticketId/status", requireAuth, requireAdmin, validateResource(updateTicketStatusSchema), updateTicketStatus);
router.post("/:ticketId/reply", requireAuth, requireAdmin, validateResource(replyTicketSchema), addReplyToTicket);
router.put("/:ticketId/assign", requireAuth, requireAdmin, validateResource(assignTicketSchema), assignTicket);
router.delete("/:ticketId", requireAuth, requireAdmin, deleteTicket);

export default router;

