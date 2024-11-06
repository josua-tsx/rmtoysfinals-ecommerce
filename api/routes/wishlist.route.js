import express from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { addToWish, addWishToCart, deleteWishlist, getUserWishlist } from '../controllers/wishlisit.controller.js'

const router = express.Router()

router.post(`/`, requireAuth, addToWish)
router.get(`/get`, requireAuth, getUserWishlist)
router.delete(`/delete`, requireAuth, deleteWishlist)
router.post(`/addWishToCart`, requireAuth, addWishToCart)

export default router