import express from "express";
import {
  addVat,
  deleteSingleVat,
  editVat,
  getSingleVat,
  getVat,
} from "../controllers/vat.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validateResource.js";
import { addVatSchema, editVatSchema } from "../schema/vat.schema.js";

const router = express.Router();

router.post("/add-vat", requireAuth, requireAdmin, validateResource(addVatSchema), addVat);
router.get("/get-vat", getVat);
router.get("/get-single-vat/:vatId", getSingleVat);
router.delete("/delete-vat/:vatId", requireAuth, requireAdmin, deleteSingleVat);
router.put("/edit-vat/:vatId", requireAuth, requireAdmin, validateResource(editVatSchema), editVat);

export default router;