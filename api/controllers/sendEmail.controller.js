import { handleMakeError } from "../middleware/handleError.js";
import { sendEmail } from "../nodemailer/nodemailer.js";

export const sendContactEmail = async (req, res, next) => {
  const { senderEmail, message, website } = req.body;
  try {
    if (!senderEmail.trim() || !message.trim())
      return next(handleMakeError(400, "Input required fields!"));

    if (website) return res.status(400).json({ error: "Spam detected" });

    // 2. Validate email
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(senderEmail.trim())) {
      return next(handleMakeError(400, "Invalid email"))
    }

    // 3. Validate message
    const cleanMessage = message.replace(/<[^>]*>?/gm, "");
    if (cleanMessage.length < 10 || cleanMessage.length > 1000) {
      return next(handleMakeError(400, "Message must be 10-1000 characters"))
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    await sendEmail(ADMIN_EMAIL, `Hello, this is ${senderEmail}, ${message}`);

    res.status(200).json({ senderEmail, message });
  } catch (error) {
    next(error);
  }
};
