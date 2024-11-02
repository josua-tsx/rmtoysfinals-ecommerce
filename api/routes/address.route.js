import express from 'express'
import { addAddress, deleteAddress, editAddress, getAddress, getAllAddress } from '../controllers/address.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post(`/add-address`, requireAuth ,addAddress)
router.get(`/get-allAddress`, getAllAddress)
router.delete(`/delete-address/:addressId`, deleteAddress)
router.put(`/edit-address/:addressId`, editAddress)
router.get(`/get-address/:addressId`, getAddress )

export default router