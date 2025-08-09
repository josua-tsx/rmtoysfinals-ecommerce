import express from 'express'
import { requireAdmin, requireAuth } from '../middleware/auth.middleware'
import { subscribeEmail } from '../controllers/subscribe.controller'


const router = express.Router()

router.post(`/subscribe-email`, requireAuth, requireAdmin, subscribeEmail)


export default router