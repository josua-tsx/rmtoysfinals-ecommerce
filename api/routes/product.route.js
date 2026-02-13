import express from "express";
import { csvUpload } from "../middleware/csvUpload.js";
import { validateResource } from "../middleware/validateResource.js";
import { createProductSchema, updateProductSchema } from "../schema/product.schema.js";
import {
  // addDraft,
  addProduct,
  // deleteDraft,
  deleteMultiProduct,
  deleteProduct,
  restoreProduct,
  getArchivedProducts,
  editProduct,
  getBestProducts,
  getBestRatedProducts,
  getBestSoldProducts,
  // getDrafts,
  // getNoStocksProducts,
  getProducts,
  getProductColors,
  getSingleProduct,
  getStockStatusPendings,
  mostReviewsProducts,
  // publishDraft,
  toggleBestProduct,
  getProductCsvTemplate,
  batchUploadProducts,
} from "../controllers/product.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

// Configure multer for CSV file upload (memory storage)


const router = express.Router();

router.post(`/add-product`, requireAuth, requireAdmin, validateResource(createProductSchema), addProduct);
router.get(`/get-products`, getProducts);
router.get(`/get-product-colors`, getProductColors);
router.get(`/get-archived-products`, requireAuth, requireAdmin, getArchivedProducts);

router.post(`/delete-multi-prod`, requireAuth, requireAdmin, deleteMultiProduct)

// router.get(`/get-nostockProducts`, getNoStocksProducts);

router.get(`/get-stockStatus-pendings`, getStockStatusPendings)

router.get(`/best-rating-product`, getBestRatedProducts)

router.get(`/best-sold-product`, getBestSoldProducts)

router.get(`/most-reviews-product`, mostReviewsProducts)


router.delete(
  `/delete-product/:productId`,
  requireAuth,
  requireAdmin,
  deleteProduct
);

router.patch(
  `/restore-product/:productId`,
  requireAuth,
  requireAdmin,
  restoreProduct
);

router.put(`/edit-product/:id`, requireAuth, requireAdmin, validateResource(updateProductSchema), editProduct);
router.get(`/get-product/:id`, getSingleProduct);

router.put(`/add-to-slider/:productId`, toggleBestProduct)
router.get(`/get-bestProducts`, getBestProducts)


// // DRAFT
// router.post(`/add-draft`, requireAuth, requireAdmin, addDraft);
// router.get(`/get-drafts`, getDrafts);
// router.delete(`/delete-draft/:draftId`, deleteDraft);
// router.post(`/publish-draft/:draftId`, publishDraft);

// BATCH UPLOAD
router.get(`/csv-template`, requireAuth, requireAdmin, getProductCsvTemplate);
router.post("/batch-upload", requireAuth, requireAdmin, csvUpload.single("file"), batchUploadProducts);

export default router;
