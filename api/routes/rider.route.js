import expres from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  addRider,
  getRiders,
  getSingleRider,
} from "../controllers/rider.controller.js";

const router = expres.Router();

router.post(`/add-rider`, requireAuth, requireAdmin, addRider);
router.get(`/get-riders`, requireAuth, requireAdmin, getRiders);
router.get(`/get-rider/:riderId`, requireAuth, requireAdmin, getSingleRider);

export default router;
