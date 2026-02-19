import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  getAllSubscribedUsers,
  getSubscribedEmails,
  toggleSubscription,
} from "../controllers/subscribe.controller.js";

const router = express.Router();

router.patch(`/toggle`, requireAuth, toggleSubscription);
router.get(`/get-subscribedEmails`, getSubscribedEmails);
router.get(`/get-all-subscribed-users`, requireAuth, requireAdmin, getAllSubscribedUsers);

export default router;
