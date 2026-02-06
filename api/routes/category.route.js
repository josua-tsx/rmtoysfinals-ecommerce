import express from "express";
import { csvUpload } from "../middleware/csvUpload.js";
import { validateResource } from "../middleware/validateResource.js";
import { createCategorySchema, updateCategorySchema } from "../schema/category.schema.js";
import {
  addCategory,
  deleteCategory,
  deleteMultiCategory,
  editCategory,
  getCategories,
  getSingleCategory,
  getCategoryCsvTemplate,
  batchAddCategories,
} from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post(`/add-category`, requireAuth, requireAdmin, validateResource(createCategorySchema), addCategory);
router.get(`/get-categories`, getCategories);
router.delete(
  `/delete-category/:categoryId`,
  requireAuth,
  requireAdmin,
  deleteCategory
);
router.put(
  `/edit-category/:categoryId`,
  requireAuth,
  requireAdmin,
  validateResource(updateCategorySchema),
  editCategory
);
router.get(`/get-single/:categoryId`, getSingleCategory);
router.post(
  `/delete-multi-category`,
  requireAuth,
  requireAdmin,
  deleteMultiCategory
);

// Batch Routes
router.get("/csv-template", requireAuth, requireAdmin, getCategoryCsvTemplate);
router.post("/batch-add", requireAuth, requireAdmin, csvUpload.single("file"), batchAddCategories);

export default router;
