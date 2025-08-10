import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  adminUpdateUserStatus,
  confirmVerifyEmail,
  deleteWorker,
  editWorker,
  getAll,
  getAllCustomer,
  getAllWorkers,
  getSingleUser,
  updateProfile,
  verifyUserEmail,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post(`/update/:id`, requireAuth, updateProfile);
router.post(`/verify-email`, verifyUserEmail);
router.post(`/confirm-email`, confirmVerifyEmail);
router.get(`/getAll`, getAll);
router.get(`/getAllCustomer`, getAllCustomer);
router.get(`/getAllWorkers`, getAllWorkers);
router.delete(
  `/delete-worker/:workerId`,
  requireAuth,
  requireAdmin,
  deleteWorker
);

router.put(`/edit-worker/:workerId`, requireAuth, requireAdmin, editWorker);

router.put(
  `/update-status/:customerId`,
  requireAuth,
  requireAdmin,
  adminUpdateUserStatus
);

router.get(`/get-user/:userId`, getSingleUser);

export default router;
