import expres from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  addRider,
  deleteRider,
  editRider,
  getRiders,
  getSingleRider,
} from "../controllers/rider.controller.js";

const router = expres.Router();

router.post(`/add-rider`, requireAuth, requireAdmin, addRider);
router.get(`/get-riders`, requireAuth, requireAdmin, getRiders);
router.get(`/get-rider/:riderId`, requireAuth, requireAdmin, getSingleRider);
router.delete(`/delete-rider/:riderId`, requireAuth, requireAdmin, deleteRider);
router.put(`/edit-rider/:riderId`, requireAuth, requireAdmin, editRider);
router.post(`/delete-multi-rider`, requireAuth, requireAdmin);

export default router;
