import express from 'express'
import {requireAuth, requireAdmin} from '../middleware/auth.middleware.js'
import { adminDeleteReview, getAllFiveStarReview, getAllFourStarReview, getAllOneStarReview, getAllThreeStarReview, getAllTwoStarReview, getRecentReview, getReviews, getSingleReview, userAddReview, userDeleteReview, userEditReview } from '../controllers/review.controller.js'

const router = express.Router()

router.post(`/add-review/:productId`, requireAuth, userAddReview)
router.get(`/get-reviews`, getReviews)
router.delete(`/delete/:reviewId`, requireAuth , userDeleteReview)
router.delete(`/adminDelete/:reviewId`, requireAuth, requireAdmin, adminDeleteReview)
router.put(`/edit/:reviewId`, requireAuth, userEditReview)
router.get(`/singleReview/:reviewId`, requireAuth, getSingleReview)

router.get(`/get-latest-review`, getRecentReview)
router.get(`/get-oneStar`, getAllOneStarReview)
router.get(`/get-twoStar`, getAllTwoStarReview)
router.get(`/get-threeStar`, getAllThreeStarReview)
router.get(`/get-fourStar`, getAllFourStarReview)
router.get(`/get-fiveStar`, getAllFiveStarReview)


export default router