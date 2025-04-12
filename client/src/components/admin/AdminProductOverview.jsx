import { Pie, PieChart, ResponsiveContainer } from "recharts";
import AdminStatCard from "./AdminStatCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import AdminProductOverviewCard from "./AdminProductOverviewCard";
import { useNavigate } from "react-router-dom";
import StarsRating from "../StarsRating";
import { TbPinnedFilled } from "react-icons/tb";

export default function AdminProductOverview() {
  const navigate = useNavigate();

  const {
    data: allCategories = [],
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/category/get-categories`);
      return res.data;
    },
  });

  const {
    data: allProducts = [],
    isPending: isProductPending,
    isError: isProductError,
  } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-products`);
      return res.data;
    },
  });

  const {
    data: allSuppliers = [],
    isPending: isSupplierPending,
    isError: isSupplierError,
  } = useQuery({
    queryKey: ["allSuppliers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/supplier/get-suppliers`);
      return res.data;
    },
  });

  //   GET BEST SINGLE SOLD PRODUCT

  const {
    data: singleBestSoldProduct = [],
    isPending: isSoldPending,
    isError: isSoldError,
  } = useQuery({
    queryKey: ["singleBestProduct"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/best-sold-product`);
      return res.data;
    },
  });

  const topSingleBestProduct = singleBestSoldProduct[0];

  const {
    data: singleBestRatingProduct = [],
    isPending: isRatingPending,
    isError: isRatingError,
  } = useQuery({
    queryKey: ["bestRatedProduct"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/best-rating-product`);
      return res.data;
    },
  });

  const topSingleBestRatingProduct = singleBestRatingProduct[0];

  const sumOfRating = topSingleBestRatingProduct?.reviews?.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating =
    sumOfRating / topSingleBestRatingProduct?.reviews?.length;

  console.log(topSingleBestRatingProduct);

  //   TOP 4 MOST REVIEWS PRODUCTS

  const {
    data: singleMostReviewsProduct = [],
    isPending: isSingleReviewPending,
    isError: isSingleReviewError,
  } = useQuery({
    queryKey: ["mostReviewsProduct"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/most-reviews-product`);
      return res.data;
    },
  });

  const topSingleMostReviewsProduct = singleMostReviewsProduct[0];

  const {
    data: latestReview = [],
    isPending: isLatestReviewPending,
    isError: isLatestReviewError,
  } = useQuery({
    queryKey: ["recentReview"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-latest-review`);
      return res.data;
    },
  });

  //   GET ALL REVIEWS

  const {
    data: allReviews = [],
    isPending: isReviewsPending,
    isError: isReviewsError,
  } = useQuery({
    queryKey: ["allReviews"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-reviews`);
      return res.data;
    },
  });

  // Construct the pieData
  const pieData = allCategories.map((category) => ({
    categoryName: category?.categoryName,
    categoryDescription: category?.products.length, // Number of products in the category
  }));

  if (
    isCategoriesPending ||
    isProductPending ||
    isSupplierPending ||
    isSoldPending ||
    isRatingPending ||
    isSingleReviewPending ||
    isLatestReviewPending ||
    isLatestReviewError ||
    isReviewsPending
  )
    return <p>Loading categories...</p>;
  if (
    isCategoriesError ||
    isProductError ||
    isSupplierError ||
    isSoldError ||
    isRatingError ||
    isSingleReviewError ||
    isReviewsError
  )
    return <p>Error loading categories</p>;

  return (
    <div className="flex flex-col bg-yellow gap-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
        <AdminStatCard
          title={"TOTAL PRODUCTS"}
          value={
            allProducts?.products?.length > 0
              ? allProducts?.products?.length
              : 0
          }
        />
        <AdminStatCard
          title={"TOTAL CATEGORIES"}
          value={allCategories.length > 0 ? allCategories.length : 0}
        />
        <AdminStatCard
          title={"TOTAL SUPPLIERS"}
          value={allSuppliers.length > 0 ? allSuppliers.length : 0}
        />
        <AdminStatCard
          title={"TOTAL PRODUCTS REVIEWS"}
          value={allReviews.length > 0 ? allReviews.length : 0}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-16 md:gap-4">
        <div className="border border-black w-full h-[400px] md:h-[422px] md:w-[50%] bg-card relative rounded-[5px]">
          <div className="absolute -top-11 -left-1 border rounded-[5px]  bg-primary text-card border-black p-1">
            <h1>CATEGORIES DISTRIBUTION</h1>
          </div>
          <ResponsiveContainer width="100%" height={"100%"}>
            <PieChart width={730} height={200}>
              {/* Outer Pie: Outer ring */}
              <Pie
                data={pieData}
                dataKey="categoryDescription"
                nameKey="categoryName"
                cx="50%"
                outerRadius={90} // Size of the outer ring
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                } // Custom label for outer pie chart (category name)
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-[50%] grid grid-cols-1 md:grid-cols-2 gap-5 relative">
          {topSingleBestProduct ? (
            <AdminProductOverviewCard
              singleBestSoldProduct={topSingleBestProduct}
              value1={"TOP 1 PRODUCT"}
              value2={`${
                topSingleBestProduct ? topSingleBestProduct?.sold : 0
              } sold`}
              onClick={() => navigate(`/product/${topSingleBestProduct._id}`)}
            />
          ) : (
            <p className="bg-card border border-black text-center rounded-[5px] flex flex-col relative justify-center">
              <div className="border-black border w-[15px] bg-yellow absolute h-[15px] right-2 top-1 rounded-full">
                <div className="  w-[15px] h-[15px] rounded-full">
                  <div className="absolute -top-6 right-[-65%]">
                    <TbPinnedFilled size={30} />
                  </div>
                </div>
              </div>
              no product yet.
            </p>
          )}

          {topSingleBestRatingProduct ? (
            <AdminProductOverviewCard
              singleBestSoldProduct={topSingleBestRatingProduct}
              value1={"TOP 1 IN RATING"}
              value2={<StarsRating rating={averageRating} />}
              onClick={() =>
                navigate(`/product/${topSingleBestRatingProduct._id}`)
              }
            />
          ) : (
            <p className="bg-card border border-black text-center rounded-[5px] flex flex-col justify-center relative">
              <div className="border-black border w-[15px] bg-yellow absolute h-[15px] right-2 top-1 rounded-full">
                <div className="  w-[15px] h-[15px] rounded-full">
                  <div className="absolute -top-6 right-[-65%]">
                    <TbPinnedFilled size={30} />
                  </div>
                </div>
              </div>
              no product yet.
            </p>
          )}

          {topSingleMostReviewsProduct ? (
            <AdminProductOverviewCard
              singleBestSoldProduct={topSingleMostReviewsProduct}
              value1={"MOST REVIEWS"}
              value2={`${
                topSingleMostReviewsProduct
                  ? topSingleMostReviewsProduct.reviewCount
                  : 0
              } reviews`}
              onClick={() =>
                navigate(`/product/${topSingleMostReviewsProduct._id}`)
              }
            />
          ) : (
            <p className="bg-card border border-black text-center rounded-[5px] flex flex-col justify-center relative">
              <div className="border-black border w-[15px] bg-yellow absolute h-[15px] right-2 top-1 rounded-full">
                <div className="  w-[15px] h-[15px] rounded-full">
                  <div className="absolute -top-6 right-[-65%]">
                    <TbPinnedFilled size={30} />
                  </div>
                </div>
              </div>
              no product yet.
            </p>
          )}

          {latestReview.length > 0 ? (
            <div className="border border-black flex justify-center items-center rounded-[5px] relative bg-card">
              <div className="border-black border w-[15px] bg-yellow absolute h-[15px] right-2 top-1 rounded-full">
                <div className="  w-[15px] h-[15px] rounded-full">
                  <div className="absolute -top-6 right-[-65%]">
                    <TbPinnedFilled size={30} />
                  </div>
                </div>
              </div>

              <div className="p-4 text-sm flex flex-col gap-3 items-center">
                <p className="text-lg">LATEST REVIEW</p>
                <p> {new Date(latestReview.createdAt).toLocaleString()}</p>
                <img
                  src={latestReview?.userId?.avatar}
                  alt="avatar"
                  className=" h-[70px] w-auto rounded-full border border-black"
                />
                <div className="w-[200px] truncate flex flex-col justify-center items-center gap-3">
                  <p>{latestReview.commentReview}</p>
                  <p>
                    <StarsRating rating={latestReview.rating} />
                  </p>
                  <button
                    className="border text-xs border-black bg-primary text-card p-1 rounded-[5px]"
                    onClick={() =>
                      navigate(`/product/${latestReview.productId}`)
                    }
                  >
                    GO TO PRODUCT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="bg-card border border-black text-center rounded-[5px] flex flex-col justify-center relative">
              <div className="border-black border w-[15px] bg-yellow absolute h-[15px] right-2 top-1 rounded-full">
                <div className="  w-[15px] h-[15px] rounded-full">
                  <div className="absolute -top-6 right-[-65%]">
                    <TbPinnedFilled size={30} />
                  </div>
                </div>
              </div>
              no review yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
