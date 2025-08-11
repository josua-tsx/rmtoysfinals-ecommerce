import expres from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import {
  addNewFaqs,
  deleteFaq,
  deleteMultiFaq,
  getAllFaqs,
  getSingleFaq,
  updateFaq,
} from "../controllers/faqs.controller.js";

const router = expres.Router();

router.post("/add-faqs", requireAuth, requireAdmin, addNewFaqs);
router.get("/get-faqs", getAllFaqs);
router.get(`/get-faq/:faqSingleId`, requireAuth, requireAdmin, getSingleFaq);
router.put(`/update-faq/:faqSingleId`, requireAuth, requireAdmin, updateFaq);
router.delete("/delete-faq/:id", requireAuth, requireAdmin, deleteFaq);
router.post(`/delete-multi-faqs`, requireAuth, requireAdmin, deleteMultiFaq);

export default router;
