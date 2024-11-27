import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";

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

  console.log(allReviews);

  const handleNavigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error.</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>REVIEWS TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search review id, product id, comments"
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="">
              <th className="font-normal p-2 pb-5">REVIEW ID</th>
              <th className="font-normal p-2 pb-5">PRODUCT ID</th>
              <th className="font-normal p-2 pb-5">EMAIL</th>
              <th className="font-normal p-2 pb-5">USERNAME</th>
              <th className="font-normal p-2 pb-5">COMMENT REVIEW</th>
              <th className="font-normal p-2 pb-5">RATING</th>
              <th className="font-normal p-2 pb-5">DATE CREATED</th>
              {/* <th className="font-normal p-2 pb-5">Stocks</th> */}
              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {filteredArrayAllReviews.length > 0 ? (
              filteredArrayAllReviews.map((review) => (
                <tr key={review._id}>
                  <td className="px-4 ">{review?._id}</td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium gap-2	">
                    {review?.productId}
                  </td>

                  <td className="px-4 py-4  whitespace-nowrap text-center text-sm">
                    {review?.userId?.email}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {review?.userId?.username}
                  </td>

                  <td className="px-6 py-4  text-indigo-700 uppercase  text-center text-sm">
                    <p className="w-[250px] truncate">
                      {review?.commentReview}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-indigo-700 uppercase whitespace-nowrap text-center text-sm">
                    {review?.rating}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    {new Date(review.createdAt).toLocaleString()}
                  </td>

                  {/* <td className="px-4 py-4 whitespace-nowrap text-cener text-sm">
                  {product.stocks}
                </td> */}
                  <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                    <button
                      onClick={() => adminDeleteReviewMutation(review._id)}
                      className="text-red-600 hover:text-red-300"
                    >
                      <MdDelete size={25} />
                    </button>
                    <button
                      onClick={() => handleNavigateToProduct(review?.productId)}
                      className="text-indigo-700 hover:text-red-300"
                    >
                      GO TO PRODUCT
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <p>no reviews yet.</p>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
