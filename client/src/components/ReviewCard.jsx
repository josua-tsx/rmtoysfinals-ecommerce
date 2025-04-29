import { TbPinnedFilled } from "react-icons/tb";
import StarsRating from "./StarsRating";
import { MdDelete, MdEdit } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import EditReviewComponent from "./EditReviewComponent";
import { useUserStore } from "../stores/useUserStore";
import { ConfirmModal } from "../reusable/ConfirmModal";

export default function ReviewCard({ review }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const [editReviewId, setEditReviewId] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: adminDeleteReviewMutation } = useMutation({
    mutationFn: async (reviewId) => {
      const res = await axiosInstance.delete(`/review/adminDelete/${reviewId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      toast.success("Review deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong.");
    },
  });

  const { mutate: userDeleteReviewMutation } = useMutation({
    mutationFn: async (reviewId) => {
      const res = await axiosInstance.delete(`/review/delete/${reviewId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      toast.success("Review deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong.");
    },
  });

  const handleDeleteClick = (reviewId) => {
    setSelectedId(reviewId);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setSelectedId(null);
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    if (selectedId) {
      if (currentUser?.role === "admin") {
        adminDeleteReviewMutation(selectedId);
      } else {
        userDeleteReviewMutation(selectedId);
      }
      setIsModalOpen(false);
    }
  };

  const {
    data: singleReview,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["singleReview", editReviewId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/review/singleReview/${editReviewId}`
      );
      return res.data;
    },
    enabled: !!editReviewId,
  });

  const handleOpenReviewEditModal = (reviewId) => {
    if (reviewId && reviewId._id !== null) {
      setEditReviewId(reviewId._id);
      setOpenEditModal(true);
    }
  };

  const isCurrentUserReview = currentUser?._id === review?.userId?._id;

  return (
    <div className="relative mb-4 rounded-xl border  border-black max-w-full  bg-yellow p-5 shadow-sm">
      {openEditModal && singleReview && !isPending && !isError && (
        <EditReviewComponent
          singleReview={singleReview}
          onClose={() => setOpenEditModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title={"Delete Review"}
        message={
          "Are you sure you want to delete this review? This action cannot be undone."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div className="absolute -top-3 right-2 text-yellow-500">
        <TbPinnedFilled size={25} />
      </div>

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

            {/* Actions */}
            {(isCurrentUserReview || currentUser?.role === "admin") && (
              <div className="flex gap-2">
                {isCurrentUserReview && (
                  <button
                    onClick={() => handleOpenReviewEditModal(review)}
                    className="text-blue-600"
                    aria-label="Edit review"
                  >
                    <MdEdit size={20} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(review._id)}
                  className="text-red-600"
                  aria-label="Delete review"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Review content */}

          {/* Review content */}
          <div className="mt-3 break-all">
            {" "}
            {/* Forces text to wrap */}
            <p className="text-gray-700">{review?.commentReview}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
