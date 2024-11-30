import { requireAuth } from "../middleware/auth.middleware.js"
import express from 'express'
import { deleteAllNotification, getNotifications, logNotification } from "../controllers/notifications.controller.js"

const router = express.Router()

router.post(`/`, requireAuth, requireAuth, logNotification)
router.get(`/get`, getNotifications)
router.delete(`/delete-all`, deleteAllNotification)

export default router