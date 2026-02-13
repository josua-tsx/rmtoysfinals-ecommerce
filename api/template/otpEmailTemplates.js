/**
 * OTP verification email templates
 */

export const otpVerificationEmail = (otpCode) => `
  <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px;">
    <h2 style="color: #333;">Verification Code</h2>
    <p>Your RM Toys verification code is:</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
      ${otpCode}
    </div>
    <p style="color: #888; font-size: 14px;">This code expires in 5 minutes. Do not share this code.</p>
  </div>
`;
