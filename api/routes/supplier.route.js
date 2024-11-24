import express from "express";
import {
  addSupplier,
  deleteSupplier,
  editSupplier,
  getSingleSupplier,
  getSuppliers,
} from "../controllers/supplier.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/add-supplier`, requireAuth, requireAdmin, addSupplier);
router.get(`/get-suppliers`, getSuppliers);
router.delete(`/delete-supplier/:supplierId`, requireAuth, requireAdmin ,deleteSupplier);
router.get(`/get-supplier/:supplierId`, getSingleSupplier);
router.put(`/edit-supplier/:supplierId`, requireAuth, requireAdmin ,editSupplier);

export default router;
