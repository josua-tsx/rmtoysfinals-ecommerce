import { validateResource } from "../middleware/validateResource.js";
import {
  addWorkerSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  signinSchema,
  signupSchema,
} from "../schema/auth.schema.js";
import {
  addWorker,
  forgetPassword,
  getMe,
  resetPassword,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { sendEmail } from "../nodemailer/nodemailer.js";
import express from "express";

const router = express.Router();

router.post(`/signup`, validateResource(signupSchema), signup);
router.post(`/signin`, validateResource(signinSchema), signin);
router.post(`/forget-password`, validateResource(forgetPasswordSchema), forgetPassword);
router.post(`/reset-password`, validateResource(resetPasswordSchema), resetPassword);
router.post(`/signout`, requireAuth, signout);
// ADD WORKER

router.post(`/add-worker`, requireAuth, requireAdmin, validateResource(addWorkerSchema), addWorker);
router.post(`/send-email`, sendEmail);


// refresh token
// router.post(`/refresh-token`, refreshToken)
router.get(`/getMe`, requireAuth, getMe);

export default router;
