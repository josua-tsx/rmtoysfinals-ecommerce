import mongoose from "mongoose";
import { handleMakeError } from "../middleware/handleError.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import { logAuditTrail } from "./audit.controller.js";
import { hasProfanity, hasThreat } from "../utils/profanityFilter.js";

// Helper: get IDs of archived products to exclude their reviews
const getArchivedProductIds = async () => {
  const archivedProducts = await Product.find({ isArchived: true }).select('_id').lean();
  return archivedProducts.map(p => p._id);
};

export const userAddReview = async (req, res, next) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { commentReview, rating } = req.body;

  try {
    const existingReview = await Review.findOne({
      userId,
      productId,
    });

    if (existingReview) {
      return next(handleMakeError(400, "You've already reviewed this product"));
    }

    if (rating < 0 || rating > 5)
      return next(handleMakeError(400, "Rating must be between 0-5"));

    if (commentReview) {
      const trimmedComment = commentReview.trim();

      // 1. Length validation (FIXED LOGIC)
      if (trimmedComment.length < 1 || trimmedComment.length > 300) {
        return next(
          handleMakeError(400, "Comment must be 1-300 characters long")
        );
      }

      // 2. Profanity check
      if (hasProfanity(trimmedComment) || hasThreat(trimmedComment)) {
        return next(
          handleMakeError(400, "Please keep comments family-friendly")
        );
      }
    }

    const findProduct = await Product.findById(productId);

    if (!findProduct || findProduct.isArchived) {
      return next(handleMakeError(400, "Product not found"));
    }

    if (!findProduct.userId.includes(userId)) {
      return next(
        handleMakeError(
          400,
          "You must buy the product first before you add can a review!"
        )
      );
    }

    const review = new Review({
      userId,
      productId,
      commentReview,
      rating,
      createdAt: new Date(),
    });
    if (!review) return next(handleMakeError(400, "No review sent!"));

    const savedReview = await review.save();

    const populatedReview = await savedReview.populate({
      path: "userId",
      select: "username avatar email",
    });

    await Product.findByIdAndUpdate(
      productId,
      {
        $push: { reviews: review },
      },
      { new: true }
    );

    await logAuditTrail({
      action: "user_added_review",
      userId,
      targetId: populatedReview._id,
      targetType: "Review",
      details: {
        description: "User added a review!",
      },
      role: "customer",
    });

    res.status(200).json({
      message: `Added a review in ${productId} product`,
      populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const archivedProductIds = await getArchivedProductIds();
    const query = { productId: { $nin: archivedProductIds } };

    if (search) {
        query.$or = [
            { _id: search },
            { commentReview: { $regex: search, $options: "i" } },
            // Search by product ID or User ID if valid ObjectId
             ...(mongoose.Types.ObjectId.isValid(search) ? [{ productId: search }, { userId: search }] : [])
        ];
    }

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate({
        path: "userId",
        select: "avatar username email",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
        reviews,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        hasMore: total > page * limit
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentReview = async (req, res, next) => {
  try {
    const archivedProductIds = await getArchivedProductIds();
    const reviews = await Review.findOne({ productId: { $nin: archivedProductIds } })
      .populate({
        path: "userId",
        select: "avatar username email",
      })
      .sort({ createdAt: -1 });

    if (!reviews) return res.status(200).json([]);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const userDeleteReview = async (req, res, next) => {
  const userId = req.user.id;
  const { reviewId } = req.params;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return next(handleMakeError(400, "no found review!"));

    if (review.userId.toString() !== userId)
      return next(
        handleMakeError(400, "You are not authorized to delete this review!")
      );

    await Review.findByIdAndDelete(reviewId);

    await Product.findByIdAndUpdate(review.productId, {
      $pull: { reviews: reviewId },
    });

    await logAuditTrail({
      action: "user_deleted_review",
      userId,
      targetId: review._id,
      targetType: "Review",
      details: {
        description: "User deleted a review!",
      },
      role: "customer",
    });

    res.status(200).json({ message: "Deleted review!", review });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return next(handleMakeError(400, "no found review!"));

    await Review.findByIdAndDelete(reviewId);

    await Product.findByIdAndUpdate(review.productId, {
      $pull: { reviews: reviewId },
    });

    await logAuditTrail({
      action: "admin_deleted_review",
      userId,
      targetId: review._id,
      targetType: "Review",
      details: {
        description: "admin deleted a review of a user!",
      },
      role: "admin",
    });

    res.status(200).json({ message: "Deleted review!", review });
  } catch (error) {
    next(error);
  }
};

export const userEditReview = async (req, res, next) => {
  const userId = req.user.id;
  const { reviewId } = req.params;

  const { commentReview, rating } = req.body;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return next(handleMakeError(400, "no review found!"));

    if (review.userId.toString() !== userId)
      return next(
        handleMakeError(400, "You are not authorized to edit this review!")
      );

    await Review.findByIdAndUpdate(
      reviewId,
      {
        commentReview,
        rating,
      },
      { new: true }
    );

    res.status(200).json({ message: "Succesfully updated review!" });
  } catch (error) {
    next(error);
  }
};

export const getSingleReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  try {
    const review = await Review.findOne({
      _id: reviewId,
      userId: userId,
    }).populate({
      path: "productId",
      select: "isArchived",
    });

    if (!review || review.productId?.isArchived) {
      return next(handleMakeError(400, "Review not found"));
    }

    return res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllOneStarReview = async (req, res, next) => {
  try {
    const archivedProductIds = await getArchivedProductIds();
    const review = await Review.find({ rating: 1, productId: { $nin: archivedProductIds } }).populate({
      path: "userId",
      select: "avatar username email",
    });
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllTwoStarReview = async (req, res, next) => {
  try {
    const archivedProductIds = await getArchivedProductIds();
    const review = await Review.find({ rating: 2, productId: { $nin: archivedProductIds } }).populate({
      path: "userId",
      select: "avatar username email",
    });
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllThreeStarReview = async (req, res, next) => {
  try {
    const archivedProductIds = await getArchivedProductIds();
    const review = await Review.find({ rating: 3, productId: { $nin: archivedProductIds } }).populate({
      path: "userId",
      select: "avatar username email",
    });
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllFourStarReview = async (req, res, next) => {
  try {
    const archivedProductIds = await getArchivedProductIds();
    const review = await Review.find({ rating: 4, productId: { $nin: archivedProductIds } }).populate({
      path: "userId",
      select: "avatar username email",
    });
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllFiveStarReview = async (req, res, next) => {
  try {
    const archivedProductIds = await getArchivedProductIds();
    const review = await Review.find({ rating: 5, productId: { $nin: archivedProductIds } }).populate({
      path: "userId",
      select: "avatar username email",
    });
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};
