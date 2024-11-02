import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { deleteWorker, getAll, getAllCustomer, getAllWorkers, updateProfile } from "../controllers/user.controller.js";


const router = express.Router()

router.post(`/update/:id`, requireAuth, updateProfile)
router.get(`/getAll`, getAll )
router.get(`/getAllCustomer`, getAllCustomer)
router.get(`/getAllWorkers`, getAllWorkers)
router.delete(`/delete-worker/:workerId`, deleteWorker)

export default router