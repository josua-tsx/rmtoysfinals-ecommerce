import express from "express";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  adminUpdateUserStatus,
  checkIfAdminExists,
  completeOnboarding,
  deleteWorker,
  editWorker,
  getAll,
  getAllCustomer,
  getAllWorkers,
  getSingleUser,
  updateProfile,
  restoreWorker,
  getArchivedWorkers,
} from "../controllers/user.controller.js";
import { editWorkerSchema, onboardingSchema, updateUserSchema } from "../schema/auth.schema.js";
import { validateResource } from "../middleware/validateResource.js";

const router = express.Router();

router.post(`/update/:id`, requireAuth, validateResource(updateUserSchema), updateProfile);
router.post(`/onboarding`, requireAuth, authLimiter, validateResource(onboardingSchema), completeOnboarding);
router.get(`/getAll`, requireAuth, requireAdmin, getAll);
router.get(`/getAllCustomer`, requireAuth, requireAdmin, getAllCustomer);
router.get(`/getAllWorkers`, requireAuth, requireAdmin, getAllWorkers);
router.get(`/check-admin`, checkIfAdminExists);

router.delete(
  `/delete-worker/:workerId`,
  requireAuth,
  requireAdmin,
  deleteWorker
);

router.put(`/edit-worker/:workerId`, requireAuth, requireAdmin, validateResource(editWorkerSchema), editWorker);

router.patch(
  `/restore-worker/:workerId`,
  requireAuth,
  requireAdmin,
  restoreWorker
);

router.get(`/get-archived-workers`, requireAuth, requireAdmin, getArchivedWorkers);

router.put(
  `/update-status/:customerId`,
  requireAuth,
  requireAdmin,
  adminUpdateUserStatus
);

router.get(`/get-user/:userId`, optionalAuth, getSingleUser);

export default router;



