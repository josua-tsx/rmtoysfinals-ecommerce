import express from 'express'
import { addGcash, deleteGcash, getAllGcash, getGcashActive, updateGcashStatus } from '../controllers/gcash.controller.js'

const router = express.Router()

router.post(`/add-gcash`, addGcash)
router.get(`/get-gcash`, getAllGcash)
router.get(`/gcash-active`, getGcashActive)
router.delete(`/delete-gcash/:gcashId`, deleteGcash)
router.put(`/:gcashId/gcash`, updateGcashStatus)

export default router