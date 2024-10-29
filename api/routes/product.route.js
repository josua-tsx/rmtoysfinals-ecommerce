import express from 'express'
import { addDraft, addProduct, deleteDraft, deleteProduct, editProduct, getDrafts, getProducts, getSingleProduct, publishDraft } from '../controllers/product.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware.js'


const router = express.Router()

router.post(`/add-product`,addProduct)
router.get(`/get-products`, getProducts)
router.delete(`/delete-product/:productId`, deleteProduct)
router.put(`/edit-product/:id`, editProduct)
router.get(`/get-product/:id`, getSingleProduct)

// DRAFT

router.post(`/add-draft`, addDraft)
router.get(`/get-drafts`, getDrafts)
router.delete(`/delete-draft/:draftId`, deleteDraft)
router.post(`/publish-draft/:draftId`, publishDraft)

export default router   