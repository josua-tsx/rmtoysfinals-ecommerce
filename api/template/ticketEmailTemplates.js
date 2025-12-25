export const customerConfirmationEmail = (ticket) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .ticket-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4CAF50; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Support Ticket Received</h1>
        </div>
        <div class="content">
          <p>Hello ${ticket.name},</p>
          <p>Thank you for contacting RM Toys support. We have received your ticket and our team will review it shortly.</p>
          
          <div class="ticket-info">
            <h3>Ticket Details</h3>
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Issue Type:</strong> ${ticket.issueType}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            ${ticket.orderNumber ? `<p><strong>Order Number:</strong> ${ticket.orderNumber}</p>` : ''}
          </div>
          
          <div class="ticket-info">
            <h4>Your Message:</h4>
            <p>${ticket.messages[0]?.message || ''}</p>
          </div>
          
          <p>We typically respond within 24-48 hours. You will receive an email notification when we reply to your ticket.</p>
          <p>Thank you for your patience!</p>
        </div>
        <div class="footer">
          <p>RM Toys - Customer Support</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const adminNotificationEmail = (ticket) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .ticket-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF5722; }
        .customer-info { background-color: #fff3e0; padding: 15px; margin: 15px 0; }
        .priority-high { color: #d32f2f; font-weight: bold; }
        .priority-medium { color: #f57c00; font-weight: bold; }
        .priority-low { color: #388e3c; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 New Support Ticket</h1>
        </div>
        <div class="content">
          <h2>A new support ticket has been created</h2>
          
          <div class="ticket-info">
            <h3>Ticket Information</h3>
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Issue Type:</strong> ${ticket.issueType}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            <p><strong>Priority:</strong> <span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></p>
            <p><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
            ${ticket.orderNumber ? `<p><strong>Order Number:</strong> ${ticket.orderNumber}</p>` : ''}
          </div>
          
          <div class="customer-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${ticket.name}</p>
            <p><strong>Email:</strong> ${ticket.email}</p>
            ${ticket.phone ? `<p><strong>Phone:</strong> ${ticket.phone}</p>` : ''}
          </div>
          
          <div class="ticket-info">
            <h4>Customer Message:</h4>
            <p>${ticket.messages[0]?.message || ''}</p>
          </div>
          
          <p><strong>Please respond to this ticket as soon as possible.</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const adminReplyEmail = (ticket, replyMessage) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .ticket-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
        .reply { background-color: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Reply to Your Support Ticket</h1>
        </div>
        <div class="content">
          <p>Hello ${ticket.name},</p>
          <p>We have replied to your support ticket. Here are the details:</p>
          
          <div class="ticket-info">
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
          </div>
          
          <div class="reply">
            <h4>Our Response:</h4>
            <p>${replyMessage}</p>
          </div>
          
          <p>If you have any further questions, please feel free to reply to this email or check your ticket status.</p>
          <p>Thank you for contacting RM Toys!</p>
        </div>
        <div class="footer">
          <p>RM Toys - Customer Support</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const statusUpdateEmail = (ticket, oldStatus, newStatus) => {
  const statusMessages = {
    Pending: "Your ticket is pending and will be reviewed shortly.",
    "In Progress": "We are currently working on your ticket.",
    Resolved: "Your ticket has been resolved. If you're satisfied with the resolution, no further action is needed.",
    Closed: "Your ticket has been closed. If you need further assistance, please create a new ticket.",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; margin-top: 20px; }
        .status-update { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #9C27B0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ticket Status Updated</h1>
        </div>
        <div class="content">
          <p>Hello ${ticket.name},</p>
          <p>The status of your support ticket has been updated.</p>
          
          <div class="status-update">
            <p><strong>Ticket ID:</strong> ${ticket._id}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>New Status:</strong> ${newStatus}</p>
          </div>
          
          <p>${statusMessages[newStatus] || "Your ticket status has been updated."}</p>
          
          <p>Thank you for your patience!</p>
        </div>
        <div class="footer">
          <p>RM Toys - Customer Support</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
