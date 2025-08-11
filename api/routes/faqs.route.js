import expres from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";
import { addNewFaqs, getAllFaqs } from "../controllers/faqs.controller.js";

const router = expres.Router();

router.post("/add-faqs", requireAuth, requireAdmin, addNewFaqs);
router.get("/get-faqs", getAllFaqs);

export default router;
