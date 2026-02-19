import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { FaPaperPlane } from "react-icons/fa";
import Buttons from "../reusable/Buttons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editReviewSchema } from "../schemas/review.schema";

export default function EditReviewComponent({ singleReview, onClose }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: singleReview?.rating || 1,
      comment: singleReview?.commentReview || "",
    },
  });

  const rating = watch("rating");

  useEffect(() => {
    if (singleReview) {
      setValue("comment", singleReview.commentReview);
      setValue("rating", singleReview.rating);
    }
  }, [singleReview, setValue]);

  const { mutate: updateSingleReviewMutation } = useMutation({
    mutationFn: async (data) => {
      // adapt data to match API expected payload if necessary
      const payload = {
        commentReview: data.comment,
        rating: data.rating,
      };
      const res = await axiosInstance.put(
        `/review/edit/${singleReview?._id}`,
        payload,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["singleReview"] });
      onClose();
      toast.success("Successfully updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  const onSubmit = (data) => {
    updateSingleReviewMutation(data);
  };

  const handleRatingChange = (newRating) => {
    setValue("rating", newRating, { shouldValidate: true });
  };

  return createPortal(
    <div className="inset-0 fixed flex flex-col p-5 justify-center items-center backdrop-blur-md z-[100] font-main overflow-y-auto">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card border flex flex-col gap-6 w-full md:w-[500px] relative border-black p-8 rounded-[5px] mt-10 "
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-10 right-0 bg-red-600 text-white border border-black px-4 py-1.5 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50 active:scale-95 group font-black"
        >
          <IoIosClose
            size={28}
            className="group-hover:rotate-90 transition-transform"
          />
        </button>
        <div className="absolute -top-6 -left-4 bg-[#22c55e] border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs transform -rotate-2">
          Editing Feedback
        </div>
        <div className="flex gap-4 flex-col mt-4">
          <h1 className="font-black uppercase text-xs tracking-wider text-center flex items-center justify-center gap-2">
            <span className="w-10 h-[2px] bg-black/10"></span>
            Revised Rating
            <span className="w-10 h-[2px] bg-black/10"></span>
          </h1>
          <div className="flex items-center border border-black rounded-[5px] bg-yellow p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <button
              className="flex-1 text-[24px] font-black text-red-700 bg-white border-r border-black hover:bg-red-50 transition-colors py-1 disabled:opacity-30"
              type="button"
              onClick={() => {
                const newR = Math.max(1, rating - 1);
                handleRatingChange(newR);
                if (rating === 1) toast.error("Minimum rating is 1");
              }}
              disabled={rating <= 1}
            >
              -
            </button>
            <div className="px-8 font-black text-2xl flex flex-col items-center">
              <span className="text-[10px] text-gray-400 -mb-1">RATING</span>
              {rating}
            </div>
            <button
              className="flex-1 text-[24px] font-black text-green-700 bg-white border-l border-black hover:bg-green-50 transition-colors py-1 disabled:opacity-30"
              type="button"
              onClick={() => {
                const newR = Math.min(5, rating + 1);
                handleRatingChange(newR);
                if (rating === 5) toast.error("Maximum rating is 5");
              }}
              disabled={rating >= 5}
            >
              +
            </button>
          </div>
          {errors.rating && (
            <p className="text-red-500 text-xs text-center">
              {errors.rating.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="font-black uppercase text-xs tracking-wider">
            Update Your Comment
          </h1>
          <div className="flex flex-col items-center gap-6">
            <textarea
              id="comment"
              placeholder="Update your feedback..."
              {...register("comment")}
              maxLength={500}
              className={`border h-[150px] p-4 ${errors.comment ? "border-red-500" : "border-black"} rounded-[5px] w-full resize-none outline-none shadow-inner bg-gray-50 focus:bg-white transition-colors`}
            ></textarea>
            {errors.comment && (
              <p className="text-red-500 text-xs w-full text-left">
                {errors.comment.message}
              </p>
            )}
            <div className="w-full">
              <Buttons
                buttonType="submit"
                isLoading={isSubmitting}
                loadingText="Updating..."
                buttonName="SAVE CHANGES"
                icon={<FaPaperPlane size={18} />}
                className="w-full p-4"
              />
            </div>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
