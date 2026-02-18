import { Pie, PieChart, ResponsiveContainer } from "recharts";
import AdminStatCard from "./AdminStatCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import AdminProductOverviewCard from "./AdminProductOverviewCard";
import { useNavigate } from "react-router-dom";
import StarsRating from "../StarsRating";
import { TbPinnedFilled } from "react-icons/tb";
import AdminStatCardSkeleton from "../skeleton/AdminStatCardSkeleton";
import AdminPieChartSkeleton from "../skeleton/AdminPieChartSkeleton";
import AdminProductOverviewCardSkeleton from "../skeleton/AdminProductOverviewCardSkeleton";
import AdminLatestReviewSkeleton from "../skeleton/AdminLatestReviewSkeleton";

export default function AdminProductOverview() {
  const navigate = useNavigate();

  /* 
    CATEGORIES 
    - Need all categories for Pie Chart distribution.
    - Fetch with high limit to get all.
  */
  const {
    data: categoriesData,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Fetch all categories for the pie chart
      const res = await axiosInstance.get(
        `/category/get-categories?limit=1000`,
      );
      return res.data;
    },
  });

  const allCategories = Array.isArray(categoriesData?.categories)
    ? categoriesData.categories
    : [];
  const totalCategories = categoriesData?.total || 0;

  /* 
    PRODUCTS 
    - Only need TOTAL count for the card.
    - Fetch with limit=1 to save bandwidth.
  */
  const {
    data: productsData,
    isPending: isProductPending,
    isError: isProductError,
  } = useQuery({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-products?limit=1`);
      return res.data;
    },
  });

  const totalProducts = productsData?.total || 0;

  /* 
    SUPPLIERS 
    - Only need TOTAL count for the card.
    - Fetch with limit=1.
  */
  const {
    data: suppliersData,
    isPending: isSupplierPending,
    isError: isSupplierError,
  } = useQuery({
    queryKey: ["allSuppliers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/supplier/get-suppliers?limit=1`);
      return res.data;
    },
  });

  const totalSuppliers = suppliersData?.total || 0;

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

  const reviews = Array.isArray(topSingleBestRatingProduct?.reviews)
    ? topSingleBestRatingProduct.reviews
    : [];
  const sumOfRating = reviews.reduce(
    (sum, review) => sum + (review.rating || 0),
    0,
  );
  const averageRating = reviews.length > 0 ? sumOfRating / reviews.length : 0;

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

  //   GET ALL REVIEWS (Count only)

  const {
    data: reviewsData,
    isPending: isReviewsPending,
    isError: isReviewsError,
  } = useQuery({
    queryKey: ["allReviews"],
    queryFn: async () => {
      // We only need the total count for the dashboard card
      const res = await axiosInstance.get(`/review/get-reviews?limit=1`);
      return res.data;
    },
  });

  const totalReviews = reviewsData?.total || 0;

  // Construct the pieData
  const pieData = (allCategories || []).map((category) => {
    const productCount = Array.isArray(category?.products)
      ? category.products.length
      : 0;
    return {
      categoryName: category?.categoryName || "Unknown",
      categoryDescription: productCount, // Number of products in the category
      value: productCount, // Also add value for better compatibility
    };
  });

  console.log("pieData:", pieData);

  if (
    isCategoriesError ||
    isProductError ||
    isSupplierError ||
    isRatingError ||
    isSingleReviewError ||
    isReviewsError ||
    isLatestReviewError
  )
    return <p>Error loading dashboard data</p>;

  return (
    <div className="flex flex-col text-sm md:text-normal bg-yellow gap-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
        {isProductPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard title={"TOTAL PRODUCTS"} value={totalProducts} />
        )}

        {isCategoriesPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard title={"TOTAL CATEGORIES"} value={totalCategories} />
        )}

        {isSupplierPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard title={"TOTAL SUPPLIERS"} value={totalSuppliers} />
        )}

        {isReviewsPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard
            title={"TOTAL PRODUCTS REVIEWS"}
            value={totalReviews}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-16 md:gap-4">
        <div className="w-full flex-1 border border-black bg-white relative rounded-lg h-[400px] overflow-visible ">
          <div className="absolute -top-5 -left-4 bg-[#22c55e] text-white border border-black px-6 py-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg transform -rotate-1 z-30">
            <h1 className="font-black uppercase tracking-widest text-sm italic">
              Categories Distribution
            </h1>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            {isCategoriesPending ? (
              <AdminPieChartSkeleton />
            ) : pieData.every((item) => item.value === 0) ? (
              <div className="flex h-full justify-center items-center p-4">
                <p className="text-center">
                  No products assigned to categories yet.
                  <br />
                  Add products to see the distribution.
                </p>
              </div>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="categoryDescription"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  stroke="#000"
                  strokeWidth={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-[50%] grid grid-cols-1 md:grid-cols-2 gap-5 relative">
          {isRatingPending ? (
            <AdminProductOverviewCardSkeleton />
          ) : topSingleBestRatingProduct ? (
            <AdminProductOverviewCard
              singleBestSoldProduct={topSingleBestRatingProduct}
              value1={"TOP 1 IN RATING"}
              value2={<StarsRating rating={averageRating} />}
              onClick={() =>
                navigate(`/product/details/${topSingleBestRatingProduct._id}`)
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

          {isSingleReviewPending ? (
            <AdminProductOverviewCardSkeleton />
          ) : topSingleMostReviewsProduct ? (
            <AdminProductOverviewCard
              singleBestSoldProduct={topSingleMostReviewsProduct}
              value1={"MOST REVIEWS"}
              value2={`${
                topSingleMostReviewsProduct
                  ? topSingleMostReviewsProduct.reviewCount
                  : 0
              } reviews`}
              onClick={() =>
                navigate(`/product/details/${topSingleMostReviewsProduct._id}`)
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

          {isLatestReviewPending ? (
            <AdminLatestReviewSkeleton />
          ) : latestReview && Object.keys(latestReview).length > 0 ? (
            <div className="border border-black flex justify-center items-center rounded-lg relative bg-white hover:translate-x-[2px] hover:translate-y-[2px] transition-all mt-6">
              {/* Floating Sticker Header */}
              <div className="absolute -top-4 -left-3 bg-primary text-white border border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-30">
                <p className="font-black uppercase tracking-widest text-[10px] leading-none">
                  LATEST REVIEW
                </p>
              </div>

              <div className="border border-black w-[20px] h-[20px] bg-yellow-400 absolute right-3 top-3 rounded-full flex items-center justify-center ">
                <div className="absolute -top-5 -right-3 rotate-45 text-black">
                  <TbPinnedFilled size={24} />
                </div>
              </div>

              <div className="p-4 pt-8 text-sm flex flex-col gap-3 items-center w-full">
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-gray-400 font-mono">
                    {new Date(latestReview.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="border-2 border-black p-1 bg-white rounded-full overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                  <img
                    src={latestReview?.userId?.avatar}
                    alt="avatar"
                    className="h-[60px] w-[60px] object-cover rounded-full"
                  />
                </div>

                <div className="w-full flex flex-col justify-center items-center gap-2">
                  <div className="text-center">
                    <p className="font-black text-black">
                      {latestReview?.userId?.fullName || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-600 italic line-clamp-2 max-w-[180px]">
                      &quot;{latestReview.commentReview}&quot;
                    </p>
                  </div>
                  <StarsRating rating={latestReview.rating} />
                  <button
                    className="w-full border border-black py-2 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all mt-1"
                    onClick={() =>
                      navigate(`/product/details/${latestReview.productId}`)
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
                <div className="w-[15px] h-[15px] rounded-full">
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
