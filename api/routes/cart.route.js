import express from 'express'

import { requireAuth } from '../middleware/auth.middleware.js'
import { addToCart, addToWishList, getCarts, getUserWishList } from '../controllers/cart.controller.js'

const router = express.Router()

router.post(`/`, requireAuth, addToCart)
router.get(`/get`, requireAuth, getCarts)

router.post(`/wishList`, requireAuth, addToWishList)
router.get(`/getWishList`, requireAuth, getUserWishList)


export default  router