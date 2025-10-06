import { Resend } from "resend";
import { config } from "dotenv";

config();

const resend = new Resend(process.env.RESEND_API_TOKEN);

console.log(process.env.RESEND_API_TOKEN);

export const resendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: "onboarding@resend.dev",
      to: to,
      subject: subject,
      html: html,
    };

    const result = await resend.emails.send(mailOptions);
    return result;
  } catch (error) {
    console.log(error);
  }
};
