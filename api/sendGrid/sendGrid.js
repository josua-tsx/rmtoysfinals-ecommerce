import sgMail from "@sendgrid/mail";
import { config } from "dotenv";

config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendGrid = async (to, subject, html) => {
  try {
    const mailOptions = {
      to,
      from: "jgonobsit@tfvc.edu.ph", // ✅ verified single sender
      subject,
      html,
    };

    const result = await sgMail.send(mailOptions);
    console.log(`✅ Email sent from gonobsit@tfvc.edu.ph to ${to}`);
    return result;
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body || error);
  }
};

