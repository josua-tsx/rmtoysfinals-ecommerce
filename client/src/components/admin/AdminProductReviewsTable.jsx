import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminProductReviewsTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: allReviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-reviews`);
      return res.data;
    },
  });

  const arrayAllReviews = Array.isArray(allReviews) ? allReviews : [];

  const { mutate: adminDeleteReviewMutation } = useMutation({
    mutationFn: async (reviewId) => {
      const res = await axiosInstance.delete(`/review/adminDelete/${reviewId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Deleted review!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong.");
    },
  });

  const filteredArrayAllReviews = arrayAllReviews.filter(
    (review) =>
      review.commentReview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review._id.includes(searchTerm) ||
      review?.productId.includes(searchTerm)
  );

  const handleNavigateToProduct = (productId) => {
    navigate(`/product/details/${productId}`);
  };

  if (isError) return <p>Error.</p>;

  return (
    <div className="font-main text-sm md:text-normal border rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Indigo Sticker Header for Reviews */}
      <div className="absolute -top-4 -left-3 bg-[#4f46e5] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Product Reviews List
        </h1>
      </div>

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 pt-8 bg-gray-50/50">
        <div className="hidden md:block">
          <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
            Browse and manage all customer ratings and feedback
          </p>
        </div>
        <div className="flex items-center relative group w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH BY ID, COMMENT, PRODUCT..."
            className="border border-black w-full md:w-[350px] rounded-[5px] py-2 pl-4 pr-10 focus:outline-none font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all placeholder:text-gray-300"
          />
          <IoSearch
            className="absolute right-3 text-black group-focus-within:scale-110 transition-transform"
            size={20}
          />
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        {isPending ? (
          <div className="flex justify-center h-[400px] items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-black">
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  REVIEW ID
                </th>
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking_widest border-r border-black text-black">
                  PRODUCT
                </th>
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  USER
                </th>
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  FEEDBACK
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  RATING
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  DATE
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest text-black">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[13px] font-bold">
              {filteredArrayAllReviews.length > 0 ? (
                filteredArrayAllReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-4 border-r border-black font-mono text-black">
                      #{review?._id.slice(-6)}...
                    </td>
                    <td className="px-4 py-4 border-r border-black">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-indigo-600">
                          #{review?.productId.slice(-8)}
                        </span>
                        <button
                          onClick={() =>
                            handleNavigateToProduct(review?.productId)
                          }
                          className="mt-1 text-left text-[9px] font-black uppercase hover:underline text-gray-500 group-hover:text-black transition-colors"
                        >
                          OPEN PRODUCT
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-black">
                      <div className="flex flex-col">
                        <span className="font-black uppercase truncate max-w-[150px] text-black">
                          {review?.userId?.username || "ANONYMOUS"}
                        </span>
                        <span className="text-[9px] font-black uppercase text-gray-500">
                          {review?.userId?.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-black">
                      <div className="bg-white border border-dashed border-gray-200 p-2 rounded-[5px] group-hover:border-black transition-colors">
                        <p className="w-[300px] sm:w-[500px] whitespace-normal line-clamp-2 italic text-gray-600">
                          {`"${review?.commentReview}"`}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`size-2 border border-black rounded-full ${
                                i < review?.rating
                                  ? "bg-amber-400"
                                  : "bg-gray-100"
                              }`}
                            ></div>
                          ))}
                        </div>
                        <span className="font-mono text-xs font-black text-black">
                          {review?.rating}.0
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <span className="text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => adminDeleteReviewMutation(review._id)}
                        className="bg-red-50 text-red-600 border border-red-600 size-10 flex items-center justify-center rounded-[5px] shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        title="Delete Review"
                      >
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-12 text-center text-gray-400 font-black uppercase tracking-widest text-xs"
                  >
                    No product reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
