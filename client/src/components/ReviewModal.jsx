import { IoIosClose } from "react-icons/io";
import { useState } from "react";
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
                <h1 className="text-center">
                  How satisfied are you with the product?
                </h1>
                <div className="flex items-center border border-black rounded-[5px] bg-yellow justify-center gap-4">
                  <button
                    className="text-[30px] text-green-700"
                    type="button"
                    onClick={() => {
                      setRating(rating + 1);
                      if (rating === 5) {
                        setRating(5);
                        return toast.error("The max rating is 5");
                      }
                    }}
                    disabled={rating === 5}
                  >
                    +
                  </button>
                  <p className="text-lg">{rating}</p>
                  <button
                    className="text-[30px] text-red-700"
                    type="button"
                    onClick={() => {
                      setRating(rating - 1);
                      if (rating === 1) {
                        setRating(1);
                        return toast.error("The min rating is 1");
                      }
                    }}
                    disabled={rating === 1}
                  >
                    -
                  </button>
                </div>
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
          <div className="bg-card h-[520px] md:h-[650px] w-full md:w-[70%] p-5 mx-auto overflow-y-auto  py-5 flex flex-col gap-4 border-black border rounded-[5px]">
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
