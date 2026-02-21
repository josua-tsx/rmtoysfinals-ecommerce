import { FaCartPlus, FaEye, FaBolt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import StarsRating from "./StarsRating";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import formatPrice from "../reusable/formatPrice";

import { CgUnavailable } from "react-icons/cg";
import { useUserStore } from "../stores/useUserStore";
import { addToGuestCart } from "../lib/utils";
import useOrderStore from "../stores/useOrderStore";

export default function ShopProductCards({ product }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setSummaryModalOpen } = useOrderStore();

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
    0,
  );
  const averageRating = sumOfRating / product?.reviews?.length;

  const colorDetail = product?.productDetails?.find(
    (detail) => detail.label === "color",
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
    <div className="w-72 md:w-full h-[320px] md:h-[350px] text-sm md:text-normal border mx-auto font-main items-center flex flex-col justify-center group bg-card border-black  hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all relative mt-4 overflow-visible rounded-[5px]">
      {/* Green Sticker Header - Category */}
      <div className="absolute -top-3 text-[10px] -right-2 bg-blue-600 text-white border border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform rotate-2 z-20">
        <span className=" uppercase tracking-wide ">
          {product?.category?.categoryName}
        </span>
      </div>

      {product?.stocks?.quantity === 0 ? (
        <div className="absolute flex gap-1 items-center text-xs border top-[-10px] -left-[10px] md:-left-2 z-10 bg-gray-800 text-white px-2 py-1 rounded-[5px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
          <span>
            <CgUnavailable size={16} />
          </span>
          <span className="font-black">OUT OF STOCK</span>
        </div>
      ) : (
        ""
      )}

      <div className="w-full flex-grow  flex justify-center relative overflow-hidden group-hover:bg-primary/5 rounded-t-[5px] bg-card pt-4">
        <img
          src={product?.productImages}
          className="w-auto h-full object-contain mix-blend-multiply"
          alt={product?.productName}
        />
        <div className="w-full absolute bottom-[-100%] border border-t-black transition-all duration-300 group-hover:bottom-0 text-black bg-card backdrop-blur-sm">
          <ul className="p-3 flex flex-col gap-3">
            <li className="flex justify-between items-center group/btn">
              <button
                className="w-full text-start py-2 px-3 bg-[#fbbf24] text-black border border-black rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all font-black uppercase text-xs flex justify-between items-center hover:bg-[#f59e0b]"
                onClick={() => {
                  if (
                    !product?.stocks?.quantity ||
                    product.stocks.quantity <= 0
                  ) {
                    toast.error("This item is currently out of stock.");
                    return;
                  }
                  setSummaryModalOpen(true, [product]);
                }}
              >
                Buy Now
                <FaBolt size={14} />
              </button>
            </li>

            <li className="flex justify-between items-center group/btn">
              <button
                className="w-full text-start py-2 px-3 bg-primary text-white border border-black rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all font-black uppercase text-xs flex justify-between items-center hover:bg-primary/90"
                onClick={() => handleAddToCart(product._id)}
              >
                Add To Cart
                <FaCartPlus size={16} />
              </button>
            </li>

            <li className="flex justify-between items-center group/btn">
              <button
                className="w-full text-start py-2 px-3 bg-white text-black border border-black rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all font-black uppercase text-xs flex justify-between items-center hover:bg-gray-100"
                onClick={() => navigate(`/product/details/${product._id}`)}
              >
                View Details
                <FaEye size={16} />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 bg-card  rounded-b-[5px] w-full relative">
        <div className="flex w-full justify-between items-start">
          <h4 className="font-bold leading-tight line-clamp-2 h-10 w-[60%]">
            {product?.productName}
          </h4>
          <p className="font-black text-blue-700 text-sm bg-blue-50 px-2 py-1 border border-blue-200 rounded">
            {formatPrice(product.price)}
          </p>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: colorDetail?.value }}
            ></span>
            <p className="uppercase text-[10px] font-bold text-gray-500">
              {colorDetail?.value}
            </p>
          </div>

          <div className="flex gap-1 items-center">
            <StarsRating rating={averageRating} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-tighter">
            PTS: {product?.points}
          </p>
          {averageRating ? (
            <p className="text-[10px] font-bold text-gray-400">
              {averageRating.toFixed(1)}/5
            </p>
          ) : (
            <p className="text-[10px] font-bold text-gray-300">New</p>
          )}
        </div>
      </div>
    </div>
  );
}
