import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { MdOutlineKeyboardArrowUp } from "react-icons/md";
import ReviewModal from "../components/ReviewModal.jsx";
import StarsRating from "../components/StarsRating.jsx";
import Buttons from "../reusable/Buttons.jsx";
import axiosInstance from "../lib/axios.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import formatPrice from "../reusable/formatPrice.js";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";
import { useUserStore } from "../stores/useUserStore.js";
import { FaCartPlus } from "react-icons/fa";
import { MdRateReview } from "react-icons/md";

export default function ProductDetails() {
  const params = useParams();
  const queryClient = useQueryClient();

  const currentUser = useUserStore((state) => state.currentUser);

  const [hideShowDetails, setHideShowDetails] = useState(true);
  const [showModalReview, setShowModalReview] = useState(false);

  const {
    data: singleProduct,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", params.productId],
    queryFn: async () => {
      const { productId } = params;
      const res = await axiosInstance.get(`/product/get-product/${productId}`);
      return res.data;
    },
  });

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

  const handleAddToCart = (productId) => {
    if (currentUser) {
      addToCartMutation({ productId });
    } else {
      console.log("etits");
    }
  };

  const sumOfRating = singleProduct?.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = sumOfRating / singleProduct?.reviews.length;

  if (isError) return <p>Error loading product...</p>;
  if (!singleProduct || Object.keys(singleProduct).length === 0) {
    return <p>No product found.</p>;
  }

  const ShowModal = () => setShowModalReview(true);

  const CloseShowModal = () => setShowModalReview(false);

  return (
    <section className="p-3  md:pb-32 pt-[130px]  text-sm md:text-normal h-full bg-yellow font-main relative">
      {showModalReview && (
        <ReviewModal
          singleProduct={singleProduct}
          closeModal={CloseShowModal}
        />
      )}

      <div className="max-w-[1280px] mx-auto relative">
        <div className="mb-5">
          <p className="uppercase text-sm">{`SHOP>${singleProduct?.productName}>${singleProduct?.category?.categoryName}`}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col h-[550px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-wrap gap-3">
            <div className="flex w-[320px] md:w-[400px] justify-between mx-auto flex-col gap-4">
              {/* main picture */}
              <div className="border h-full flex items-center bg-card rounded-[5px] border-black p-4  relative overflow-hidden">
                <img
                  src={singleProduct?.productImages[0]}
                  alt="product-main-image"
                  className="w-full max-h-[500px] mx-auto object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="flex gap-4 justify-start w-full overflow-x-auto pb-2">
                {singleProduct.productImages.length > 0 &&
                  singleProduct?.productImages.slice(1).map((images) => (
                    <div
                      key={images}
                      className="bg-white border-2 border-black px-4 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0"
                    >
                      <img
                        src={images}
                        alt=""
                        className="w-[60px] md:w-[80px] h-auto object-contain mix-blend-multiply"
                      />
                    </div>
                  ))}
              </div>
            </div>

            <div className="border flex relative flex-col justify-between gap-6 flex-1 bg-card rounded-[5px] w-[320px] md:w-full mx-auto p-6 border-black ">
              {/* PRODUCT DEATAILS */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 w-full relative">
                  <div className="absolute -top-10 -left-8 bg-[#22c55e] text-white border border-black px-6 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
                    <span className="font-black uppercase tracking-widest text-xs ">
                      {singleProduct?.category?.categoryName}
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black break-all tracking-tighter uppercase font-main pt-2">
                    {singleProduct.productName}
                  </h1>
                </div>

                <div className="flex flex-col gap-1 border-l-4 border-primary pl-4 py-1">
                  <p className="text-xs  font-black  uppercase">Description</p>
                  <p className="text-gray-700 leading-relaxed">
                    {singleProduct.productDescription}
                  </p>
                </div>

                {/* STARS */}
                <div className="flex gap-3 items-center bg-white border border-black p-2 rounded-[5px] w-fit shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <StarsRating rating={averageRating} />
                  <p className=" font-bold text-xs uppercase">
                    {averageRating ? averageRating.toFixed(1) : 0} Average
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/50 border border-black p-4 rounded-[5px]">
                  <div className="flex items-center justify-between border-b border-black/10 pb-2">
                    <p className=" font-black text-xs text-gray-500 uppercase">
                      Price
                    </p>
                    <div className="text-xl  font-black text-blue-700">
                      {formatPrice(singleProduct.price)} PHP
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-black/10 pb-2">
                    <p className=" font-black text-xs text-gray-500 uppercase">
                      Stocks
                    </p>
                    <div className="text-xl  font-black text-blue-700">
                      {singleProduct?.stocks?.quantity > 0 ? (
                        formatPrice(singleProduct?.stocks?.quantity)
                      ) : (
                        <span className="text-red-600 font-black">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-black/10 pb-2">
                    <p className=" font-black text-xs text-gray-500 uppercase">
                      Sold
                    </p>
                    <div className="text-xl  font-black text-blue-700">
                      {singleProduct?.sold || 0}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-black/10 pb-2">
                    <p className=" font-black text-xs text-gray-500 uppercase">
                      Points
                    </p>
                    <div className="text-xl  font-black text-blue-700 bg-blue-100 px-3 py-0.5 rounded-full border border-blue-300">
                      {singleProduct?.points || 0}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Buttons
                    buttonName="Technical Specs"
                    onClick={() => setHideShowDetails(!hideShowDetails)}
                    icon={
                      hideShowDetails ? (
                        <MdOutlineKeyboardArrowDown size={25} />
                      ) : (
                        <MdOutlineKeyboardArrowUp size={25} />
                      )
                    }
                    className="bg-white !text-black px-4 py-3"
                  />

                  {hideShowDetails && (
                    <div className="border bg-white rounded-[5px] border-black p-4 gap-3 flex flex-col shadow-inner">
                      {singleProduct.productDetails.length > 0
                        ? singleProduct.productDetails.map((detail, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center border-b border-gray-100 pb-1 last:border-0 last:pb-0"
                            >
                              <p className=" font-black text-[10px]  uppercase tracking-tighter">
                                {detail.label}
                              </p>
                              <span className=" font-bold text-sm bg-gray-50 px-2 py-0.5 border border-gray-200 rounded">
                                {detail.value}
                              </span>
                            </div>
                          ))
                        : singleProduct.productDetails.length > 0 &&
                          singleProduct.productDetails.map((detail, index) => (
                            <div key={index} className="flex uppercase gap-3">
                              <p className="uppercase">{detail.label}:</p>
                              <span>{detail.value}</span>
                            </div>
                          ))}
                    </div>
                  )}
                </div>
              </div>
              {/* SEE ALL REVIEWS AND ADD REVIEWS */}
              <div className="flex justify-between py-2 border-t border-black mt-4">
                <button
                  onClick={() => ShowModal()}
                  className=" font-black uppercase text-xs hover:text-primary transition-colors flex items-center gap-2"
                >
                  <MdRateReview size={18} />
                  See All Reviews ({singleProduct?.reviews?.length || 0})
                </button>
              </div>
            </div>

            {/* BUY AND ADD BUTTON*/}
            <div className="border w-[327px] md:w-full lg:w-[240px] mx-auto flex flex-col gap-5 h-fit border-black bg-card rounded-[5px] p-6 ">
              <div className="flex flex-col gap-4">
                <Buttons
                  onClick={() => handleAddToCart(singleProduct._id)}
                  buttonName="Add to cart"
                  icon={<FaCartPlus size={20} />}
                  animateIcon={true}
                  className=""
                />

                <Buttons
                  onClick={() => ShowModal()}
                  buttonName="Add Review"
                  icon={<MdRateReview size={20} />}
                  animateIcon={true}
                  className="bg-white !text-black"
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-[10px]  font-black  uppercase tracking-tighter">
                  Secure Transaction
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
