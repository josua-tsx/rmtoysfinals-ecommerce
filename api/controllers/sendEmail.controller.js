import { handleMakeError } from "../middleware/handleError.js";
import { sendEmail } from "../nodemailer/nodemailer.js";

export const sendContactEmail = async (req, res, next) => {
  const { senderEmail, message } = req.body;
  try {
    if (!senderEmail.trim() || !message.trim())
      return next(handleMakeError(400, "Input required fields!"));

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    await sendEmail(
      ADMIN_EMAIL,
      `Hello, this is ${senderEmail}, ${message}`
    );

    res.status(200).json({senderEmail, message})
  } catch (error) {
    next(error);
  }
};
