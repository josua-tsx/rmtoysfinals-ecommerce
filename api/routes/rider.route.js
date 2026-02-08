import express from "express";
import { csvUpload } from "../middleware/csvUpload.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validateResource.js";
import {
  addRider,
  deleteMultiRider,
  deleteRider,
  editRider,
  getRiders,
  getSingleRider,
  getRiderCsvTemplate,
  batchAddRiders,
  restoreRider,
  getArchivedRiders,
} from "../controllers/rider.controller.js";
import { deleteMultiRiderSchema, editRiderSchema, riderSchema } from "../schema/rider.schema.js";

const router = express.Router();


router.post("/add-rider", requireAuth, requireAdmin, validateResource(riderSchema), addRider);
router.get("/get-all-rider", getRiders);
router.get("/get-single-rider/:riderId", getSingleRider);
router.delete("/delete-rider/:riderId", requireAuth, requireAdmin, deleteRider);
router.put("/edit-rider/:riderId", requireAuth, requireAdmin, validateResource(editRiderSchema), editRider);
router.post("/delete-multi-rider", requireAuth, requireAdmin, validateResource(deleteMultiRiderSchema), deleteMultiRider);

router.patch("/restore-rider/:riderId", requireAuth, requireAdmin, restoreRider);
router.get("/get-archived-riders", requireAuth, requireAdmin, getArchivedRiders);

// Batch Routes
router.get("/csv-template", requireAuth, requireAdmin, getRiderCsvTemplate);
router.post("/batch-add", requireAuth, requireAdmin, csvUpload.single("file"), batchAddRiders);

export default router;
