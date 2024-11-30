import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import ReviewModal from "../components/ReviewModal.jsx";
import StarsRating from "../components/StarsRating.jsx";
import Buttons from "../reusable/Buttons.jsx";
import axiosInstance from "../lib/axios.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import formatPrice from "../reusable/formatPrice.js";

export default function ProductDetails() {
  const params = useParams();
  const queryClient = useQueryClient();

  const [hideShowDetails, setHideShowDetails] = useState(true);
  const [showModalReview, setShowModalReview] = useState(false);
  const [rating, setRating] = useState(4);

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

  console.log(singleProduct);

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

  const { mutate: addToWishListMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/wish`, productId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Succesfully Added to Wishlist");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleAddToCart = (productId) => {
    addToCartMutation({ productId });
  };

  const handleAddToWishList = (productId) => {
    addToWishListMutation({ productId });
  };

  const sumOfRating = singleProduct?.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating = sumOfRating / singleProduct?.reviews.length;



  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading product...</p>;
  if (!singleProduct || Object.keys(singleProduct).length === 0) {
    return <p>No product found.</p>;
  }

  const ShowModal = () => setShowModalReview(true);

  const CloseShowModal = () => setShowModalReview(false);

  return (
    <section className="p-3 pt-[130px] font-main relative">
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

        <div className="flex flex-col md:flex-row flex-wrap gap-3">
          <div className="flex w-[320px] md:w-[400px] justify-between mx-auto flex-col gap-2">
            {/* main picture */}
            <div className="border h-full flex items-center bg-card rounded-[5px] border-black p-3">
              <img
                src={singleProduct?.productImages[0]}
                alt="product-main-image"
              />
            </div>

            <div className="flex gap-2 justify-between w-full">
              {singleProduct.productImages.length > 0 &&
                singleProduct?.productImages.slice(1).map((images) => (
                  <div
                    key={images}
                    className="bg-card border-black border px-5 p-3 rounded-[5px]"
                  >
                    <img src={images} alt="" className="w-[85px] h-auto" />
                  </div>
                ))}
            </div>
          </div>

          <div className="border flex relative flex-col justify-between gap-2 flex-1  bg-card rounded-[5px] w-[320px] md:w-[full] mx-auto p-3 border-black">
            {/* PRODUCT DEATAILS */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 w-full">
                <h1 className="text-2xl md:text-4xl ">
                  {singleProduct.productName}
                </h1>
              </div>

              <div className="flex gap-8">
                <p>DESCRIPTION:</p>
                <p>{singleProduct.productDescription}</p>
              </div>

              {/* STARS */}
              <div className="flex gap-2 items-center">
                <StarsRating rating={averageRating} />
                <p>({averageRating ? averageRating.toFixed(2) : 0} average)</p>
              </div>

              <div className="uppercase flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <p>PRICE:</p>
                  <span className="text-lg text-indigo-500">
                    {formatPrice(singleProduct.price)} PHP
                  </span>
                </div>
                {singleProduct?.stocks ? (
                  <div className="flex items-center gap-3">
                    <p>Stocks:</p>
                    <span className="text-lg text-indigo-500">
                      {formatPrice(singleProduct?.stocks?.stockQuantity)}
                    </span>
                  </div>
                ) : (
                  ""
                )}
                <div className="flex items-center gap-3">
                  <p>category:</p>
                  <span className="text-lg text-indigo-500">
                    {singleProduct?.category?.categoryName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <p>SOLD:</p>
                  <span className="text-lg text-indigo-500">
                    {singleProduct?.sold}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <p>PRODUCT DETAILS</p>
                <button onClick={() => setHideShowDetails(!hideShowDetails)}>
                  <MdOutlineKeyboardArrowDown size={25} />
                </button>
              </div>

              <div
                className={`border ${
                  hideShowDetails ? "flex" : "hidden"
                } rounded-[5px] border-black p-3 gap-2 flex-col`}
              >
                {singleProduct.productDetails.length > 0 &&
                  singleProduct.productDetails.map((detail, index) => (
                    <div key={index} className="flex uppercase gap-3">
                      <p className="uppercase">{detail.label}:</p>
                      <span>{detail.value}</span>
                    </div>
                  ))}
              </div>

              {/* ADD ADITIONAL INFORMATIONS */}
            </div>
            {/* SEE ALL REVIEWS AND ADD REVIEWS */}
            <div className="flex justify-between">
              <button
                onClick={() => ShowModal()}
                className="uppercase underline text-indigo-500"
              >
                see all reviews ({singleProduct?.reviews?.length})
              </button>
              <button
                onClick={() => ShowModal()}
                className="uppercase underline text-indigo-500"
              >
                add review
              </button>
            </div>
          </div>

          {/* BUY AND ADD BUTTON*/}
          <div className="border w-[327px] md:w-full lg:w-[210px] mx-auto flex flex-col gap-2 h-full border-black bg-card rounded-[5px] p-4">
            <div
              onClick={() => handleAddToCart(singleProduct._id)}
              className=""
            >
              <Buttons buttonName={"Add to cart"} />
            </div>
            <div onClick={() => handleAddToWishList(singleProduct._id)}>
              <Buttons buttonName={"Add to wishlist"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
