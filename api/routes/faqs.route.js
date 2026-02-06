import express from "express";
import { csvUpload } from "../middleware/csvUpload.js";
import {
  addNewFaqs,
  deleteFaq,
  deleteMultiFaq,
  getAllFaqs,
  getSingleFaq,
  updateFaq,
  getFaqCsvTemplate,
  batchAddFaqs,
} from "../controllers/faqs.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { validateResource } from "../middleware/validateResource.js";
import { deleteMultiFaqsSchema, faqsSchema, updateFaqSchema } from "../schema/faqs.schema.js";

const router = express.Router();



router.post("/add-new-faqs", requireAuth, requireAdmin, validateResource(faqsSchema), addNewFaqs);
router.get("/get-all-faqs", getAllFaqs);
router.delete("/delete-faq/:id", requireAuth, requireAdmin, deleteFaq);
router.post("/delete-multi-faqs", requireAuth, requireAdmin, validateResource(deleteMultiFaqsSchema), deleteMultiFaq);
router.get("/get-single-faq/:faqSingleId", getSingleFaq);
router.put("/update-faq/:faqSingleId", requireAuth, requireAdmin, validateResource(updateFaqSchema), updateFaq);

// Batch FAQ Routes
router.get("/batch/template", requireAuth, requireAdmin, getFaqCsvTemplate);
router.post("/batch/upload", requireAuth, requireAdmin, csvUpload.single("file"), batchAddFaqs);

export default router;
