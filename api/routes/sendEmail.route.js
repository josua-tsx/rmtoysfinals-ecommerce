import express from 'express'
import { sendContactEmail } from '../controllers/sendEmail.controller.js'
import { strictLimiter } from '../middleware/rateLimiter.js'


const router = express.Router()

router.post(`/send-email`, strictLimiter, sendContactEmail)

export default router