import express from "express";
import {
  addCategory,
  deleteCategory,
  deleteMultiCategory,
  editCategory,
  getCategories,
  getSingleCategory,
} from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/add-category`, requireAuth, requireAdmin, addCategory);
router.get(`/get-categories`, getCategories);
router.delete(`/delete-category/:categoryId`, requireAuth, requireAdmin , deleteCategory);
router.put(`/edit-category/:categoryId`, requireAuth, requireAdmin ,editCategory);
router.get(`/get-single/:categoryId`, getSingleCategory);
router.post(`/delete-multi-category`, requireAdmin, requireAuth, deleteMultiCategory)

export default router;
