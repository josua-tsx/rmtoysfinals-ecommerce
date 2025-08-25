import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  getSubscribedEmails,
  subscribeEmail,
  unsubscribeEmail,
} from "../controllers/subscribe.controller.js";

const router = express.Router();

router.post(`/subscribe-email`, requireAuth, subscribeEmail);
router.get(`/get-subscribedEmails`, getSubscribedEmails);
router.patch(`/unsubscribe`, requireAuth, unsubscribeEmail);

export default router;
