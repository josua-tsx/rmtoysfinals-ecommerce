import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  addToCart,
  deleteCart,
  getCarts,
  getSelectedCart,
  updateQuantity,
  updateSelect,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post(`/`, requireAuth, addToCart);
router.get(`/get`, requireAuth, getCarts);
router.get(`/get-selecteds`, requireAuth, getSelectedCart);
router.delete(`/delete`, requireAuth, deleteCart);
router.put(`/update-select/:productId`, requireAuth, updateSelect);
router.post(`/updateQuantity`, requireAuth, updateQuantity);

export default router;
