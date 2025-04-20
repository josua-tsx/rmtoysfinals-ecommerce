import { IoIosClose } from "react-icons/io";
import {  useState } from "react";
import ReviewCard from "./ReviewCard.jsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios.js";
import toast from "react-hot-toast";
import { FaPaperPlane } from "react-icons/fa";

export default function ReviewModal({ singleProduct, closeModal }) {
  const [showReview, setShowReview] = useState(false);
  const [commentReview, setCommentReview] = useState("");
  const [rating, setRating] = useState(1);

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
    <section className=" pt-[105px] md:pt-[130px] text-sm md:text-normal inset-0 fixed z-40 backdrop-blur-sm p-3">
      <div className="md:max-w-[90%] lg:max-w-[65%]  h-screen  mx-auto">
        <div className="flex flex-col md:flex-row-reverse gap-2 relative">
          {/* close button */}
          <button
            onClick={closeModal}
            className="absolute border  border-black  text-card bg-primary rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>

          <div className="md:w-[28%] flex flex-col gap-2">
            <div className="flex bg-card border rounded-[5px] p-3 border-black flex-col text-center gap-2">
              <h1 className="text-normal">Add Review Here</h1>
              <button
                onClick={() => setShowReview(!showReview)}
                type="button"
                className="border border-black bg-primary text-card p-1 w-full rounded-[5px]"
              >
                {showReview ? "Hide Review" : "Add Review"}
              </button>
            </div>

            {/* add review goes here */}
            <form
               onSubmit={handleSubmitReview}
              className={`${
                showReview ? "flex" : "hidden"
              } flex-col gap-5 bg-card border rounded-[5px] p-3  border-black`}
            >
              <div className="flex gap-2 flex-col ">
                <h1 className="text-center">How satisfied are you with the product?</h1>
                <input
                  type="number"
                  value={rating}
                  min={1}
                  max={5}
                  className="outline-none border p-1 text-center border-black rounded-[5px]"
                  onChange={(e) => {
                    const value = Math.max(
                      1,
                      Math.min(5, Number(e.target.value))
                    ); // Ensures rating is between 1 and 5
                    setRating(value);
                  }}
                />
              </div>

              <div className=" flex flex-col gap-2 ">
                <h1>Add your comment here</h1>
                <div className="flex flex-col items-center gap-2">
                  <textarea
                    name="review"
                    id="review"
                    value={commentReview}
                    onChange={(e) => setCommentReview(e.target.value)}
                    className="border h-[150px] p-2 border-black rounded-[5px] w-full resize-none outline-none"
                  ></textarea>
                  <div className="w-full">
                  <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary border border-black py-2 font-medium text-white transition  disabled:opacity-70"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <FaPaperPlane />
                    Submit Review
                  </>
                )}
                </button>
                  </div>
                </div>
              </div>
            </form>

          </div>
          <div className="bg-card h-[655px] w-full md:w-[70%] p-5 mx-auto overflow-y-auto  py-5 flex flex-col gap-4 border-black border rounded-[5px]">
            {/* REVIEW CARD GOES HERE */}

            {singleProduct?.reviews?.length > 0 ? (
              [...singleProduct?.reviews]
                ?.reverse()
                .map((review, index) => (
                  <ReviewCard key={index} review={review} />
                ))
            ) : (
              <p className="text-center">no review yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
