import { handleMakeError } from "../middleware/handleError.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import { logAuditTrail } from "./audit.controller.js";
import { hasProfanity, hasThreat } from "../utils/profanityFilter.js";

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
    const reviews = await Review.find().populate({
      path: "userId",
      select: "avatar username email",
    });
    if (!reviews) return res.status(200).json([]);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const getRecentReview = async (req, res, next) => {
  try {
    const reviews = await Review.findOne()
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
    });

    // // If the review is not found or doesn't belong to the logged-in user, return an error
    // if (!review) {
    //   return next(handleMakeError(400, "You can only edit yours!"));
    // }

    return res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllOneStarReview = async (req, res, next) => {
  try {
    const review = await Review.find({ rating: 1 }).populate({
      path: "userId",
      select: "avatar username email",
    });
    if (review.length === 0) res.status(200).json([]);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllTwoStarReview = async (req, res, next) => {
  try {
    const review = await Review.find({ rating: 2 }).populate({
      path: "userId",
      select: "avatar username email",
    });
    if (review.length === 0) res.status(200).json([]);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllThreeStarReview = async (req, res, next) => {
  try {
    const review = await Review.find({ rating: 3 }).populate({
      path: "userId",
      select: "avatar username email",
    });
    if (review.length === 0) res.status(200).json([]);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllFourStarReview = async (req, res, next) => {
  try {
    const review = await Review.find({ rating: 4 }).populate({
      path: "userId",
      select: "avatar username email",
    });
    if (review.length === 0) res.status(200).json([]);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const getAllFiveStarReview = async (req, res, next) => {
  try {
    const review = await Review.find({ rating: 5 }).populate({
      path: "userId",
      select: "avatar username email",
    });
    if (review.length === 0) res.status(200).json([]);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};
