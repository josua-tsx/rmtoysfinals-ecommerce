import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  adminUpdateUserStatus,
  checkIfAdminExists,
  completeOnboarding,
  confirmVerifyEmail,
  deleteWorker,
  editWorker,
  getAll,
  getAllCustomer,
  getAllWorkers,
  getSingleUser,
  updateProfile,
  verifyUserEmail,
  restoreWorker,
  getArchivedWorkers,
} from "../controllers/user.controller.js";
import { editWorkerSchema, onboardingSchema, updateUserSchema } from "../schema/auth.schema.js";
import { validateResource } from "../middleware/validateResource.js";

const router = express.Router();

router.post(`/update/:id`, requireAuth, validateResource(updateUserSchema), updateProfile);
router.post(`/verify-email`, authLimiter, verifyUserEmail);
router.post(`/confirm-email`, confirmVerifyEmail);
router.post(`/onboarding`, requireAuth, authLimiter, validateResource(onboardingSchema), completeOnboarding);
router.get(`/getAll`, getAll);
router.get(`/getAllCustomer`, getAllCustomer);
router.get(`/getAllWorkers`, getAllWorkers);
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

router.get(`/get-user/:userId`, getSingleUser);

export default router;



