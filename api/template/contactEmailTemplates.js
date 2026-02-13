/**
 * Contact form email templates
 */

export const contactFormEmail = (senderEmail, message) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">📩 New Contact Message</h2>
    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
      <p><strong>From:</strong> ${senderEmail}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 12px 0;" />
      <p>${message}</p>
    </div>
    <p style="color: #888; font-size: 12px; margin-top: 16px;">Sent via RM Toys contact form</p>
  </div>
`;
