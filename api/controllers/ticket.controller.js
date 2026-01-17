import Ticket from "../models/ticket.model.js";
import { handleMakeError } from "../middleware/handleError.js";
import { sendGrid } from "../sendGrid/sendGrid.js";
import { getIO } from "../services/socketService.js";
import {
  customerConfirmationEmail,
  adminNotificationEmail,
  adminReplyEmail,
  statusUpdateEmail,
} from "../template/ticketEmailTemplates.js";

// Create a new ticket
export const createTicket = async (req, res, next) => {
  try {
    const {
      email,
      name,
      phone,
      orderNumber,
      issueType,
      subject,
      message,
      priority,
      images,
    } = req.body;

    // Validation
    if (!email || !name || !issueType || !subject || !message) {
      return next(
        handleMakeError(
          400,
          "Please provide all required fields: email, name, issueType, subject, and message"
        )
      );
    }

    // Get userId if user is authenticated
    const userId = req.user?._id || null;

    // Create the ticket with initial message
    const newTicket = new Ticket({
      userId,
      email: email.toLowerCase(),
      name,
      phone,
      orderNumber,
      issueType,
      subject,
      status: "Pending",
      priority: priority || "Medium",
      messages: [
        {
          sender: "customer",
          senderName: name,
          message,
          images: images || [],
          timestamp: new Date(),
          isRead: false,
        },
      ],
    });

    await newTicket.save();

    // Send confirmation email to customer
    try {
      await sendGrid(
        email,
        `Support Ticket Created - ${subject}`,
        customerConfirmationEmail(newTicket)
      );
    } catch (emailError) {
      console.error("Error sending customer confirmation email:", emailError);
    }

    // Send notification email to admin
    try {
      const adminEmail = process.env.SHOP_EMAIL || "support@rmtoys.store";
      await sendGrid(
        adminEmail,
        `New Support Ticket - ${issueType}`,
        adminNotificationEmail(newTicket)
      );
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError);
    }

    // Emit real-time notification to admin dashboard
    try {
      const io = getIO();
      io.to("admin-room").emit("new-ticket", {
        ticketId: newTicket._id,
        subject: newTicket.subject,
        customerName: newTicket.name,
        issueType: newTicket.issueType,
        priority: newTicket.priority,
        createdAt: newTicket.createdAt,
      });
    } catch (socketError) {
      console.error("Error emitting socket event:", socketError);
    }

    res.status(201).json({
      success: true,
      message: "Ticket created successfully. We'll respond to you shortly.",
      ticket: newTicket,
    });
  } catch (error) {
    next(error);
  }
};

// Get all tickets (Admin only)
export const getAllTickets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      issueType,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter query
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (issueType) filter.issueType = issueType;

    // Search by ticket ID, name, or email
    if (search) {
      filter.$or = [
        { _id: search },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch tickets
    const tickets = await Ticket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email")
      .populate("assignedTo", "name email");

    // Get total count
    const totalTickets = await Ticket.countDocuments(filter);
    const totalPages = Math.ceil(totalTickets / parseInt(limit));

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTickets,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get tickets for a specific user
export const getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { email } = req.query;

    if (!userId && !email) {
      return next(
        handleMakeError(
          400,
          "Please provide user authentication or email parameter"
        )
      );
    }

    // Build filter
    const filter = userId ? { userId } : { email: email.toLowerCase() };

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .select("-messages.isRead"); // Don't expose read status to customers

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

// Get single ticket by ID
export const getSingleTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user?._id;
    const isAdmin = req.user?.role === "admin" || req.user?.role === "validatorStaff";

    const ticket = await Ticket.findById(ticketId)
      .populate("userId", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return next(handleMakeError(404, "Ticket not found"));
    }

    // Check access: Admin can see all tickets, users can only see their own
    if (!isAdmin) {
      const hasAccess =
        (userId && ticket.userId && ticket.userId._id.equals(userId)) ||
        (!userId && req.query.email && ticket.email === req.query.email.toLowerCase());

      if (!hasAccess) {
        return next(
          handleMakeError(403, "You don't have permission to view this ticket")
        );
      }
    }

    // Mark messages as read by admin
    if (isAdmin) {
      ticket.messages.forEach((msg) => {
        if (msg.sender === "customer") {
          msg.isRead = true;
        }
      });
      await ticket.save();
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};



// Update ticket status (Admin only)
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status, priority } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return next(handleMakeError(404, "Ticket not found"));
    }

    const oldStatus = ticket.status;

    // Update fields
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;

    await ticket.save();

    // Send status update email to customer
    if (status && status !== oldStatus) {
      try {
        await sendGrid(
          ticket.email,
          `Ticket Status Updated - ${ticket.subject}`,
          statusUpdateEmail(ticket, oldStatus, status)
        );
      } catch (emailError) {
        console.error("Error sending status update email:", emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// Add reply to ticket (Admin)
export const addReplyToTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const adminName = req.user?.name || "Support Team";

    if (!message) {
      return next(handleMakeError(400, "Message is required"));
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return next(handleMakeError(404, "Ticket not found"));
    }

    // Add admin reply to messages
    ticket.messages.push({
      sender: "admin",
      senderName: adminName,
      message,
      timestamp: new Date(),
      isRead: false,
    });

    // Update status to "In Progress" if it's still pending
    if (ticket.status === "Pending") {
      ticket.status = "In Progress";
    }

    await ticket.save();

    // Send email notification to customer
    try {
      await sendGrid(
        ticket.email,
        `New Reply - ${ticket.subject}`,
        adminReplyEmail(ticket, message)
      );
    } catch (emailError) {
      console.error("Error sending reply notification email:", emailError);
    }

    // Emit real-time notification to customer if they have a userId
    if (ticket.userId) {
      try {
        const io = getIO();
        io.to(`customer-${ticket.userId.toString()}`).emit("admin-reply", {
          ticketId: ticket._id,
          subject: ticket.subject,
          replyPreview: message.substring(0, 50),
          adminName,
        });
      } catch (socketError) {
        console.error("Error emitting socket event to customer:", socketError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// Add reply to ticket (Customer)
export const customerReplyToTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message, images } = req.body;
    const userId = req.user?._id;
    const customerName = req.user?.name || "Customer";

    if (!message) {
      return next(handleMakeError(400, "Message is required"));
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return next(handleMakeError(404, "Ticket not found"));
    }

    // Check if user owns this ticket
    if (!ticket.userId || !ticket.userId.equals(userId)) {
      return next(handleMakeError(403, "You can only reply to your own tickets"));
    }

    // Check if ticket is closed
    if (ticket.status === "Closed") {
      return next(handleMakeError(400, "Cannot reply to a closed ticket"));
    }

    // Add customer reply to messages
    ticket.messages.push({
      sender: "customer",
      senderName: customerName,
      message,
      images: images || [],
      timestamp: new Date(),
      isRead: false,
    });

    await ticket.save();

    // Optionally notify admin of new customer reply
    try {
      const adminEmail = process.env.SHOP_EMAIL || "support@rmtoys.store";
      await sendGrid(
        adminEmail,
        `Customer Reply - ${ticket.subject}`,
        adminNotificationEmail(ticket)
      );
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError);
    }

    // Emit real-time notification to admin dashboard
    try {
      const io = getIO();
      io.to("admin-room").emit("new-ticket-reply", {
        ticketId: ticket._id,
        subject: ticket.subject,
        customerName: ticket.name,
        replyPreview: message.substring(0, 50),
      });
    } catch (socketError) {
      console.error("Error emitting socket event:", socketError);
    }

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// Assign ticket to admin (Admin only)
export const assignTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { adminId } = req.body;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return next(handleMakeError(404, "Ticket not found"));
    }

    ticket.assignedTo = adminId;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

// Delete ticket (Admin only)
export const deleteTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByIdAndDelete(ticketId);

    if (!ticket) {
      return next(handleMakeError(404, "Ticket not found"));
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get ticket statistics (Admin only)
export const getTicketStats = async (req, res, next) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const pendingTickets = await Ticket.countDocuments({ status: "Pending" });
    const inProgressTickets = await Ticket.countDocuments({
      status: "In Progress",
    });
    const resolvedTickets = await Ticket.countDocuments({ status: "Resolved" });
    const closedTickets = await Ticket.countDocuments({ status: "Closed" });

    // Get tickets by issue type
    const ticketsByIssueType = await Ticket.aggregate([
      {
        $group: {
          _id: "$issueType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalTickets,
        pending: pendingTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        byIssueType: ticketsByIssueType,
        byPriority: ticketsByPriority,
      },
    });
  } catch (error) {
    next(error);
  }
};
