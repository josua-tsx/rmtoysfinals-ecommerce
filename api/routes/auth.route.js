import express from 'express'
import { addWorker, getMe, refreshToken, signin, signout, signup } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post(`/signup`, signup)
router.post(`/signin`, signin)
router.post(`/signout`, signout)
// ADD WORKER

router.post(`/add-worker`, addWorker)


// refresh token
router.post(`/refresh-token`, refreshToken)
router.get(`/getMe`, requireAuth ,getMe)



export default router