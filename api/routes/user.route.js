import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { getAll, getAllCustomer, updateProfile } from "../controllers/user.controller.js";


const router = express.Router()

router.post(`/update/:id`, requireAuth, updateProfile)
router.get(`/getAll`, getAll )
router.get(`/getAllCustomer`, getAllCustomer)
// router.get(`/getAllWorkers`, getAllWorkers)

export default router