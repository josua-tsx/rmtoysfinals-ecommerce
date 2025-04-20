import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  deleteAllAuditLogs,
  getAdminLogs,
  getCustomerLogs,
  getValidatorStaffLogs,
  logAuditTrail,
} from "../controllers/audit.controller.js";

const router = express.Router();

router.post(`/`, requireAuth, requireAdmin, logAuditTrail);
router.get(`/admin`, getAdminLogs);
router.get(`/customer`, getCustomerLogs);
router.get(`/validatorStaff`, getValidatorStaffLogs);
router.delete(`/delete-audits`, deleteAllAuditLogs)

export default router;
