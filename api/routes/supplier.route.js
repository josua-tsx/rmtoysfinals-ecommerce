import express from "express";
import { validateResource } from "../middleware/validateResource.js";
import { createSupplierSchema, updateSupplierSchema } from "../schema/supplier.schema.js";
import {
  addSupplier,
  deleteMultiSupplier,
  deleteSupplier,
  editSupplier,
  getSingleSupplier,
  getSuppliers,
} from "../controllers/supplier.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/add-supplier`, requireAuth, requireAdmin, validateResource(createSupplierSchema), addSupplier);
router.get(`/get-suppliers`, getSuppliers);
router.delete(
  `/delete-supplier/:supplierId`,
  requireAuth,
  requireAdmin,
  deleteSupplier
);
router.get(`/get-supplier/:supplierId`, getSingleSupplier);
router.put(
  `/edit-supplier/:supplierId`,
  requireAuth,
  requireAdmin,
  validateResource(updateSupplierSchema),
  editSupplier
);
router.post(
  `/delete-multi-sup`,
  requireAuth,
  requireAdmin,
  deleteMultiSupplier
);

export default router;
