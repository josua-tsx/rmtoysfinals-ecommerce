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

function hideName(name) {
  // Ensure the input is a string
  const strName = String(name || "");

  // If the name is too short (less than 3 chars), we can't get the first and last two.
  // In this case, we'll just return asterisks.
  if (strName.length < 3) {
    return "***";
  }

  // Get the first character
  const firstChar = strName[0];

  // Get the last two characters
  const lastTwoChars = strName.slice(-2);

  // Combine them with the asterisks
  return `${firstChar}***${lastTwoChars}`;
}

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
    <div className="relative mb-6 rounded-[5px] border border-black max-w-full bg-card p-6  transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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

      <div className="absolute -top-3 right-4 text-black transform rotate-12">
        <TbPinnedFilled size={28} />
      </div>

      {/* Review header */}
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="relative group">
          <img
            src={review?.userId?.avatar || "/default-avatar.png"}
            alt={review?.userId?.username}
            className="h-12 w-12 rounded-full border border-black object-cover shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all"
          />
        </div>

        <div className="flex-1 w-full">
          <di v className="flex items-center justify-between mb-2">
            <div>
              <h3 className=" font-black uppercase text-sm tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                {hideName(review?.userId?.username)}
              </h3>
              <div className="mt-2 flex items-center gap-3 bg-yellow/20 border border-black/10 p-1.5 rounded-sm w-fit">
                <StarsRating rating={review.rating} size={14} />
                <span className=" font-black text-[10px] text-gray-400 uppercase">
                  RATING: {review.rating}/5
                </span>
              </div>
            </div>

            {/* Actions */}
            {(isCurrentUserReview || currentUser?.role === "admin") && (
              <div className="flex gap-2">
                {isCurrentUserReview && (
                  <button
                    onClick={() => handleOpenReviewEditModal(review)}
                    className="bg-white border border-black p-2 rounded-[5px] shadow-[3px_3px_0px_0px_rgba(59,130,246,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95 text-blue-600"
                    aria-label="Edit review"
                  >
                    <MdEdit size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(review._id)}
                  className="bg-white border border-black p-2 rounded-[5px] shadow-[3px_3px_0px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95 text-red-600"
                  aria-label="Delete review"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            )}
          </di>

          <div className="mt-4 p-4 bg-gray-50 border border-black rounded-[5px] shadow-inner relative overflow-hidden group/text">
            {/* Decorative corner element */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-full group-hover/text:w-10 group-hover/text:h-10 transition-all"></div>

            <p className="text-gray-800  text-sm leading-relaxed relative z-10 break-words">
              {review?.commentReview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
