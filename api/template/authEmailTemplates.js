/**
 * Authentication-related email templates
 */

export const passwordResetEmail = (username, resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p>Hello ${username},</p>
    <p>You requested a password reset. Click the button below to set a new password (expires in 15 minutes):</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetLink}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 32px; border-radius: 5px; text-decoration: none; font-weight: bold;">
        Reset Password
      </a>
    </div>
    <p style="color: #888; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="color: #888; font-size: 14px; word-break: break-all;">${resetLink}</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
    <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
  </div>
`;
