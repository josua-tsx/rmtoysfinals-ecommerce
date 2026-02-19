import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validateResource.js";
import {
  addToCartSchema,
  deleteCartSchema,
  updateCartQuantitySchema,
  updateCartSelectionSchema,
} from "../schema/cart.schema.js";
import {
  addToCart,
  deleteCart,
  getCarts,
  getSelectedCart,
  updateQuantity,
  updateSelect,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post(`/`, requireAuth, validateResource(addToCartSchema), addToCart);
router.get(`/get`, requireAuth, getCarts);
router.get(`/get-selecteds`, requireAuth, getSelectedCart);
router.delete(`/delete`, requireAuth, validateResource(deleteCartSchema), deleteCart);
router.put(`/update-select/:productId`, requireAuth, validateResource(updateCartSelectionSchema), updateSelect);
router.post(`/updateQuantity`, requireAuth, validateResource(updateCartQuantitySchema), updateQuantity);

export default router;
