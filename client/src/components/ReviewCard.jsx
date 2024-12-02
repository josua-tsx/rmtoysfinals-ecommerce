import { TbPinnedFilled } from "react-icons/tb";
import StarsRating from "./StarsRating";
import { MdDelete } from "react-icons/md";
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
      toast.success("Deleted review!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong.");
    },
  });

  const handleDeleteClick = (reviewId) => {
    setSelectedId(reviewId);
    setIsModalOpen(true);
  };

  const handleDeleteClick2 =  (reviewId) => {
    setSelectedId(reviewId);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setSelectedId(null);
    setIsModalOpen(false);
  };

  const handleConfirmAdmin = async () => {
    if (selectedId) {
      adminDeleteReviewMutation(selectedId);
      userDeleteReviewMutation(selectedId);
      setIsModalOpen(false);
    }
  };
  const handleConfirmCustomer = () => {
    if (selectedId) {
    userDeleteReviewMutation(selectedId);
      setIsModalOpen(false);
    }
  };

  const { mutate: userDeleteReviewMutation } = useMutation({
    mutationFn: async (reviewId) => {
      const res = await axiosInstance.delete(`/review/delete/${reviewId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      toast.success("Deleted review!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong.");
    },
  });

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

  return (
    <div className="relative border font-main flex flex-col gap-3 w-full mx-auto px-2 md:px-5 py-4 rounded-[5px] bg-card border-black ">
      {/* <EditReviewComponent/> */}
      {openEditModal && singleReview && !isPending && !isError && (
        <EditReviewComponent
          singleReview={singleReview}
          onClose={() => setOpenEditModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title={"Delete confirm"}
        message={
          "Are you sure you want delete this review? This action can not be undone."
        }
        onConfirm={() =>
          currentUser.role === "admin"
            ? handleConfirmAdmin()
            : handleConfirmCustomer()
        }
        onCancel={handleCancel}
      />

      {/* PIN */}
      <div className="border-black border w-[15px] bg-yellow absolute h-[15px] right-2 top-1 rounded-full">
        <div className="  w-[15px] h-[15px] rounded-full">
          <div className="absolute -top-6 right-[-65%]">
            <TbPinnedFilled size={30} />
          </div>
        </div>
      </div>

      <div className="flex gap-4 flex-col justify-between  w-full">
        <div className="flex flex-col items-center gap-4 justify-between">
          <div className="flex gap-2 w-full justify-center md:mr-5 md:justify-end text-sm">
            <button
              onClick={() => handleOpenReviewEditModal(review)}
              type="button"
              className="text-green-600"
            >
              EDIT
            </button>
            {currentUser.role === "admin" ? (
              <button
                onClick={() => handleDeleteClick(review._id)}
                type="button"
                className="text-red-600"
              >
                <MdDelete size={23} />
              </button>
            ) : (
              <button
                onClick={() => handleDeleteClick2(review._id)}
                type="button"
                className="text-red-600"
              >
                <MdDelete size={23} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 items-center">
            <img
              src={review?.userId?.avatar}
              alt="reviewer imgae"
              className="w-[50px] rounded-full border border-black object-cover"
            />
            <div className="flex flex-row gap-4">
              <h1>{review?.userId?.username}</h1>
              <div className="flex items-center gap-2">
                <StarsRating rating={review.rating} />
                <p>({review.rating})</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-black bg-card p-2 max-h-[150px] overflow-y-auto rounded-[5px] flex flex-col gap-4">
          <p className="w-full ">{review?.commentReview}</p>
        </div>
      </div>
    </div>
  );
}
