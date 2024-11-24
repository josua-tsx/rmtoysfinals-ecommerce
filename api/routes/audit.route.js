import express from 'express'
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { getAdminLogs, logAuditTrail } from '../controllers/audit.controller.js';

const router = express.Router()

router.post(`/`, requireAuth, requireAdmin, logAuditTrail)
router.get(`/admin`, getAdminLogs)


export default router