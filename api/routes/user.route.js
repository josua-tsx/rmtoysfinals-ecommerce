import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { deleteWorker, getAll, getAllCustomer, getAllWorkers, getSingleUser, updateProfile } from "../controllers/user.controller.js";


const router = express.Router()

router.post(`/update/:id`, requireAuth, updateProfile)
router.get(`/getAll`, getAll )
router.get(`/getAllCustomer`, getAllCustomer)
router.get(`/getAllWorkers`, getAllWorkers)
router.delete(`/delete-worker/:workerId`, deleteWorker)

router.get(`/get-user/:userId`, getSingleUser)

export default router