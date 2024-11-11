import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { addCartToWish, addToCart, deleteCart, getCarts, updateQuantity } from "../controllers/cart.controller.js";

const router = express.Router();

router.post(`/`, requireAuth, addToCart);
router.get(`/get`, requireAuth, getCarts);
router.delete(`/delete`, requireAuth, deleteCart)
router.post(`/addCartToWish`, requireAuth, addCartToWish)
router.post(`/updateQuantity`, requireAuth, updateQuantity)

export default router;
