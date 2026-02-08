import { useQuery } from "@tanstack/react-query";
import ShopProductCards from "../components/ShopProductCards";
import { TbPinnedFilled } from "react-icons/tb";
import axiosInstance from "../lib/axios";
import { useNavigate } from "react-router-dom";
import CreditPointsAuto from "../components/CreditPointsAuto";
import ShopProductCardSkeleton from "../components/skeleton/ShopProductCardSkeleton";

export default function PopularPage() {
  const navigate = useNavigate();

  const handleNavigateToShop = () => {
    navigate(`/shop`);
  };

  const {
    data: bestSoldProducts = [],
    isPending: isBestPending,
    isError: isBestError,
  } = useQuery({
    queryKey: ["bestSoldProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/best-sold-product`);
      return res.data;
    },
  });

  const {
    data: bestRatingProducts = [],
    isPending: isRatingPending,
    isError: isRatingError,
  } = useQuery({
    queryKey: ["bestRatingProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/best-rating-product`);
      return res.data;
    },
  });

  if (isBestError || isRatingError) return <p>Error.</p>;

  return (
    <section className="pt-[130px] h-full bg-yellow pb-[100px]  p-3 font-main">
      <div className="max-w-[1280px] bg-yellow mx-auto">
        <div className="flex w-full mb-5">
          <h1 className="text-3xl">Popular Products</h1>
        </div>
        <CreditPointsAuto />
        <div className="flex flex-col gap-14">
          <div>
            <div className="mb-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2 bg-[#22c55e] text-white border border-black px-6 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1">
                <h1 className="text-lg md:text-xl  font-black uppercase tracking-widest">
                  Best Sold
                </h1>
                <TbPinnedFilled size={24} />
              </div>
              <button
                onClick={handleNavigateToShop}
                className="bg-white border border-black px-4 py-1.5 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all  font-black uppercase text-xs active:scale-95"
              >
                See More
              </button>
            </div>
            {isBestPending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <ShopProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bestSoldProducts.length > 0 ? (
                  bestSoldProducts.map((best) => (
                    <ShopProductCards key={best._id} product={best} />
                  ))
                ) : (
                  <p className=" text-sm opacity-50">No product yet.</p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="mb-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2 bg-[#22c55e] text-white border border-black px-6 py-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform rotate-1">
                <h1 className="text-lg md:text-xl  font-black uppercase tracking-widest">
                  Best Rating
                </h1>
                <TbPinnedFilled size={24} />
              </div>
              <button
                onClick={handleNavigateToShop}
                className="bg-white border-2 border-black px-4 py-1.5 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all  font-black uppercase text-xs active:scale-95"
              >
                See More
              </button>
            </div>

            {isRatingPending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                  <ShopProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {bestRatingProducts.length > 0 ? (
                  bestRatingProducts.map((rating) => (
                    <ShopProductCards key={rating._id} product={rating} />
                  ))
                ) : (
                  <p>No product yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
