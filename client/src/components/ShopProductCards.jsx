import { FaCartPlus, FaSleigh } from "react-icons/fa";
import { IoHeart } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import StarsRating from "./StarsRating";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import formatPrice from "../reusable/formatPrice";

import { CgUnavailable } from "react-icons/cg";
import { useUserStore } from "../stores/useUserStore";
import { addToGuestCart } from "../lib/utils";
// import { addToGuestCart } from "../lib/utils";

export default function ShopProductCards({ product }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const currentUser = useUserStore((state) => state.currentUser);

  const { mutate: addToCartMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/cart`, productId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Succesfully Added to cart");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const sumOfRating = product?.reviews?.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = sumOfRating / product?.reviews?.length;

  const colorDetail = product?.productDetails?.find(
    (detail) => detail.label === "color"
  );

  const handleAddToCart = (productId) => {
    if (currentUser) {
      addToCartMutation({ productId });
    } else {
      try {
        console.log(product);

        addToGuestCart({
          ...product,
          quantity: 1,
          isSelected: false,
        });
        toast.success("Added to guest cart");
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (!product || Object.keys(product).length === 0) {
    return <p>No product found.</p>;
  }

  return (
    <div className="w-72 md:w-full h-[250px] rounded-[5px] md:h-[310px] text-sm md:text-normal border mx-auto font-main items-center flex flex-col justify-center group rounded-toy bg-card border-black shadow-hard hover:shadow-hard-sm hover:translate-y-1 transition-all relative">
      <div className="border p-1 text-xs z-10 bg-primary uppercase text-card font-medium absolute top-[-10px] right-[-10px] border-black rounded-toy shadow-hard-sm">
        {product?.category?.categoryName}
      </div>

      {product?.stocks?.quantity === 0 ? (
        <div className="absolute flex gap-1 items-center  text-sm border top-[-10px] -left-[10px] md:-left-1 z-10 bg-gray-700 text-card p-1 rounded-toy border-black shadow-hard-sm">
          <span>
            <CgUnavailable size={20} />
          </span>
          OUT OF STOCK
        </div>
      ) : (
        ""
      )}

      <div className="w-full h-full flex justify-center relative overflow-hidden group-hover:bg-primary rounded-t-[5px]">
        <img src={product?.productImages} className="w-auto" />
        <div className="w-full absolute bottom-[-100%] border border-t-black transition-all group-hover:bottom-0 text-black bg-card">
          <ul className="p-2 flex flex-col gap-2">
            <li className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <button
                className="w-full text-start"
                onClick={() => handleAddToCart(product._id)}
              >
                Add To Cart
              </button>
              <FaCartPlus size={20} />
            </li>

            <li className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <button
                className="w-full text-start"
                onClick={() => navigate(`/product/details/${product._id}`)}
              >
                View Details
              </button>
              <FaEye size={20} />
            </li>
          </ul>
        </div>
      </div>

      <div className="p-2 flex flex-col gap-2 justify-between bg-card border-t-gray-300 border rounded-b-[5px]  w-full relative">
        <div className="flex w-full justify-between">
          <p className="">{product?.productName}</p>
          <p className="uppercase text-blue-700">
            {formatPrice(product.price)} PHP
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className="w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: colorDetail?.value }}
            ></span>
            <p className="uppercase">{colorDetail?.value}</p>
          </div>

          <div className="flex gap-2 items-center">
            <StarsRating rating={averageRating} />
            {averageRating ? <p>({averageRating.toFixed(2)} average)</p> : ""}
          </div>
        </div>
        <div>
          <p className="text-sm text-blue-700">POINTS: {product?.points}</p>
        </div>
      </div>
    </div>
  );
}
