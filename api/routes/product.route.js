import express from "express";
import {
  addDraft,
  addProduct,
  deleteDraft,
  deleteProduct,
  editProduct,
  getBestProducts,
  getBestRatedProducts,
  getBestSoldProducts,
  getDrafts,
  // getNoStocksProducts,
  getProducts,
  getSingleProduct,
  getStockStatusPendings,
  mostReviewsProducts,
  publishDraft,
  toggleBestProduct,
} from "../controllers/product.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(`/add-product`, requireAuth, requireAdmin, addProduct);
router.get(`/get-products`, getProducts);

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

router.put(`/edit-product/:id`, requireAuth, requireAdmin, editProduct);
router.get(`/get-product/:id`, getSingleProduct);

router.put(`/add-to-slider/:productId`, toggleBestProduct)
router.get(`/get-bestProducts`, getBestProducts)

// DRAFT
router.post(`/add-draft`, requireAuth, requireAdmin, addDraft);
router.get(`/get-drafts`, getDrafts);
router.delete(`/delete-draft/:draftId`, deleteDraft);
router.post(`/publish-draft/:draftId`, publishDraft);

export default router;
