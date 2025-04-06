import express from 'express'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js'
import { addVat, deleteSingleVat, editVat, getSingleVat, getVat } from '../controllers/vat.controller.js'

const router = express.Router()

router.post(`/add-vat`, requireAuth, requireAdmin, addVat)
router.get(`/get-vat`, requireAuth, requireAdmin, getVat)
router.get(`/get-vat/:vatId`, getSingleVat)
router.delete(`/delete-vat/:vatId`, requireAuth, requireAdmin, deleteSingleVat)
router.put(`/edit-vat/:vatId`, requireAuth, requireAdmin, editVat)

export default router