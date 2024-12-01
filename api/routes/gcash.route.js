import express from "express";
import {
  addGcash,
  deleteGcash,
  editGcash,
  getAllGcash,
  getGcashActive,
  getSingleGcash,
  updateGcashStatus,
} from "../controllers/gcash.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/add-gcash`, requireAuth, requireAdmin, addGcash);
router.get(`/get-gcash`, getAllGcash);
router.get(`/gcash-active`, getGcashActive);
router.delete(`/delete-gcash/:gcashId`, requireAuth, requireAdmin, deleteGcash);
router.put(`/:gcashId/gcash`, requireAuth, requireAdmin, updateGcashStatus);
router.put(`/edit-gcash/:gcashId`, requireAuth, requireAdmin, editGcash);
router.get(`/get-single/:gcashId`, getSingleGcash);

export default router;
