import nodemailer from "nodemailer";
import { config } from "dotenv";

config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL_SECRET,
    pass: process.env.NODEMAILER_EMAIL_PASS,
  },

  // Add timeout settings
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 15000, // 15 seconds
  greetingTimeout: 5000, // 5 seconds
});

export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL_SECRET, // Sender address
      to, // Recipient address
      subject, // Email subject
      text, // Email body
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
