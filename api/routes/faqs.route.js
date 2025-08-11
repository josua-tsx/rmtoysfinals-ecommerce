import expres from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  addNewFaqs,
  deleteFaq,
  getAllFaqs,
} from "../controllers/faqs.controller.js";

const router = expres.Router();

router.post("/add-faqs", requireAuth, requireAdmin, addNewFaqs);
router.get("/get-faqs", getAllFaqs);
router.delete("/delete-faq/:id", requireAuth, requireAdmin, deleteFaq);

export default router;
