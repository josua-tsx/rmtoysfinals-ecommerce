import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

// Create Brevo (Sendinblue) transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,      // Brevo SMTP login (e.g., xxx@smtp-brevo.com)
    pass: process.env.BREVO_SMTP_KEY,   // Your Brevo SMTP key
  },
});

export const sendGrid = async (to, subject, html) => {
  try {
    const mailOptions = {
      to,
      from: process.env.BREVO_SENDER_EMAIL, // Verified sender email
      subject,
      html,
    };
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return result;
  } catch (error) {
    console.error("❌ Brevo email error:", error.message || error);
    throw error;
  }
};
