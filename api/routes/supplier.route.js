import express from "express";
import { csvUpload } from "../middleware/csvUpload.js";
import { validateResource } from "../middleware/validateResource.js";
import { createSupplierSchema, updateSupplierSchema } from "../schema/supplier.schema.js";
import {
  addSupplier,
  deleteMultiSupplier,
  deleteSupplier,
  restoreSupplier,
  getArchivedSuppliers,
  editSupplier,
  getSingleSupplier,
  getSuppliers,
  toggleNotification,
  getSupplierCsvTemplate,
  batchAddSuppliers,
} from "../controllers/supplier.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post(`/add-supplier`, requireAuth, requireAdmin, validateResource(createSupplierSchema), addSupplier);
router.get(`/get-suppliers`, getSuppliers);
router.get(`/get-archived-suppliers`, requireAuth, requireAdmin, getArchivedSuppliers);
router.delete(
  `/delete-supplier/:supplierId`,
  requireAuth,
  requireAdmin,
  deleteSupplier
);

router.patch(
  `/restore-supplier/:supplierId`,
  requireAuth,
  requireAdmin,
  restoreSupplier
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

router.patch(
  `/toggle-notification/:supplierId`,
  requireAuth,
  requireAdmin,
  toggleNotification
);

// Batch Routes
router.get("/csv-template", requireAuth, requireAdmin, getSupplierCsvTemplate);
router.post("/batch-add", requireAuth, requireAdmin, csvUpload.single("file"), batchAddSuppliers);

export default router;
