import { IoIosClose } from "react-icons/io";
import { useState } from "react";
import ReviewCard from "./ReviewCard.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { FaPaperPlane } from "react-icons/fa";
import { MdRateReview } from "react-icons/md";
import Buttons from "../reusable/Buttons.jsx";

export default function ReviewModal({ singleProduct, closeModal }) {
  const [showReview, setShowReview] = useState(false);
  const [commentReview, setCommentReview] = useState("");
  const [rating, setRating] = useState(1);

  console.log(singleProduct);

  const queryClient = useQueryClient();

  const { mutate: addReviewMutation, isPending: isSubmitting } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        `/review/add-review/${singleProduct._id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setRating(1);
      setCommentReview("");
      toast.success(`Added a review!`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  console.log(singleProduct);

  const handleSubmitReview = (e) => {
    e.preventDefault();

    addReviewMutation({
      productId: singleProduct._id,
      commentReview,
      rating,
    });
  };

  return (
    <section className="pt-[50px] md:pt-[130px] text-sm md:text-normal inset-0 fixed z-50 backdrop-blur-md p-3 font-main overflow-y-auto">
      <div className="max-w-[1200px] mx-auto min-h-screen pb-10">
        <div className="flex flex-col md:flex-row-reverse gap-6 relative">
          <div
            className={` ${
              singleProduct?.reviews
                ? "md:w-[35%]"
                : "w-[100%] md:w-[50%] mx-auto"
            } flex flex-col gap-4 relative`}
          >
            {/* close button */}
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 bg-red-600 text-white border border-black px-4 py-1.5 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50 active:scale-95 group font-black"
            >
              <IoIosClose
                size={28}
                className="group-hover:rotate-90 transition-transform"
              />
            </button>

            <div className="flex bg-card border border-black rounded-[5px] p-4  flex-col text-center gap-4 relative mt-2 pt-8">
              {/* Retro Note Sticker */}
              <div className="bg-[#ef4444] text-white border border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform rotate-1 mb-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 bg-white p-1 rounded-sm border border-black">
                    <svg
                      className="h-4 w-4 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="text-left text-normal  uppercase tracking-tight leading-tight">
                    <p>NOTE: ONE REVIEW PER PRODUCT.</p>
                    <p className="mt-1 opacity-90 lowercase ">
                      Only for purchased items.
                    </p>
                  </div>
                </div>
              </div>

              <h1 className="font-black uppercase text-sm tracking-widest text-gray-500">
                Review Section
              </h1>
              <button
                onClick={() => setShowReview(!showReview)}
                type="button"
                className="bg-[#22c55e] text-white border border-black p-3 w-full rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-black uppercase tracking-widest text-xs active:scale-95"
              >
                {showReview ? "Cancel Review" : "Add Your Review"}
              </button>
            </div>

            {/* add review goes here */}
            <form
              onSubmit={handleSubmitReview}
              className={`${
                showReview ? "flex" : "hidden"
              } flex-col gap-6 bg-card border border-black rounded-[5px] p-6  mt-2`}
            >
              <div className="flex gap-4 flex-col">
                <h1 className="font-black uppercase text-xs tracking-wider text-center flex items-center justify-center gap-2">
                  <span className="w-10 h-[2px] bg-black/10"></span>
                  Satisfaction Level
                  <span className="w-10 h-[2px] bg-black/10"></span>
                </h1>

                <div className="flex items-center border border-black rounded-[5px] bg-yellow p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <button
                    className="flex-1 text-[24px] font-black text-red-700 bg-white border-r border-black hover:bg-red-50 transition-colors py-1 disabled:opacity-30"
                    type="button"
                    onClick={() => {
                      setRating(rating - 1);
                      if (rating === 1) {
                        setRating(1);
                        return toast.error("Minimum rating is 1");
                      }
                    }}
                    disabled={rating === 1}
                  >
                    -
                  </button>
                  <div className="px-8 font-black text-2xl flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 -mb-1">
                      RATING
                    </span>
                    {rating}
                  </div>
                  <button
                    className="flex-1 text-[24px] font-black text-green-700 bg-white border-l border-black hover:bg-green-50 transition-colors py-1 disabled:opacity-30"
                    type="button"
                    onClick={() => {
                      setRating(rating + 1);
                      if (rating === 5) {
                        setRating(5);
                        return toast.error("Maximum rating is 5");
                      }
                    }}
                    disabled={rating === 5}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="font-black uppercase text-xs tracking-wider">
                  Your Comments
                </h1>

                <div className="flex flex-col items-center gap-4">
                  <textarea
                    name="review"
                    id="review"
                    value={commentReview}
                    placeholder="Type your feedback here..."
                    onChange={(e) => setCommentReview(e.target.value)}
                    className="border h-[150px] p-4 border-black rounded-[5px] w-full resize-none outline-none shadow-inner bg-gray-50 focus:bg-white transition-colors"
                  ></textarea>

                  <Buttons
                    buttonType="submit"
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText="TRANSMITTING..."
                    buttonName="SUBMIT FEEDBACK"
                    icon={<FaPaperPlane size={18} />}
                    animateIcon={true}
                    className="w-full py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>
            </form>
          </div>

          {singleProduct?.reviews && (
            <div className="bg-card h-[650px] w-full md:w-[65%] p-6 mx-auto overflow-y-auto flex flex-col gap-6 border border-black rounded-[5px] ">
              {" "}
              {/* shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] green shadow*/}
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-black uppercase tracking-widest text-lg">
                  Product Reviews
                </h2>
                <div className="bg-black text-white px-3 py-1 rounded text-xs">
                  {singleProduct?.reviews?.length || 0} TOTAL
                </div>
              </div>
              {singleProduct?.reviews?.length > 0 ? (
                [...(singleProduct?.reviews || [])]
                  .reverse()
                  .map((review, index) => (
                    <ReviewCard key={index} review={review} />
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-300 transform opacity-20">
                  <MdRateReview size={80} />
                  <p className="font-black uppercase tracking-widest text-2xl">
                    no feedback yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
