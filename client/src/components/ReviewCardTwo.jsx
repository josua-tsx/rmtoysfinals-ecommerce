import { TbPinnedFilled } from "react-icons/tb";
import StarsRating from "./StarsRating";
import { MdDelete } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import EditReviewComponent from "./EditReviewComponent";
import { useNavigate } from "react-router-dom";

export default function ReviewCardTwo({ review}) {
  const navigate = useNavigate()
  const handleNavigate = (productId) => {
    navigate(`/product/${productId}`)
  }


  return (
    <div className="relative mb-4 rounded-xl border border-black bg-card p-5 shadow-sm">
    
          <div className="absolute -top-3 right-2 text-yellow-500">
            <TbPinnedFilled size={25} />
          </div>

          <button onClick={() => handleNavigate(review.productId)}
className="flex text-sm text-indigo-700 underline justify-end w-full">go to product!</button>
    
          {/* Review header */}
          <div className="flex items-start gap-5">
            <img
              src={review?.userId?.avatar || "/default-avatar.png"}
              alt={review?.userId?.username}
              className="h-10 w-10 rounded-full border border-black object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {review?.userId?.username}
                  </h3>
                  <div className="flex items-center gap-1">
                    <StarsRating rating={review.rating} size={16} />
                    {/* <span className="text-sm text-gray-500">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </span> */}
                  </div>
                </div>
    
              </div>
    
              {/* Review content */}
              <div className="mt-3">
                <p className="text-gray-700">{review?.commentReview}</p>
              </div>
            </div>
          </div>
        </div>
  );
}

