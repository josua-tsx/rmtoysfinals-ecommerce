import express from "express";
import {
  addPoints,
  deleteSinglePoints,
  editPoints,
  getSinglePoints,
  getPoints,
} from "../controllers/points.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validateResource.js";
import { addPointsSchema, editPointsSchema } from "../schema/points.schema.js";

const router = express.Router();

router.post("/add-points", requireAuth, requireAdmin, validateResource(addPointsSchema), addPoints);
router.get("/get-points", getPoints);
router.get("/get-single-points/:pointsId", getSinglePoints);
router.delete("/delete-points/:pointsId", requireAuth, requireAdmin, deleteSinglePoints);
router.put("/edit-points/:pointsId", requireAuth, requireAdmin, validateResource(editPointsSchema), editPoints);

export default router;
