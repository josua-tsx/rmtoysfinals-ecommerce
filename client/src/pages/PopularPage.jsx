import { useQuery } from "@tanstack/react-query";
import ShopProductCards from "../components/ShopProductCards";
import { TbPinnedFilled } from "react-icons/tb";
import axiosInstance from "../lib/axios";
import { useNavigate } from "react-router-dom";
import CreditPointsAuto from "../components/CreditPointsAuto";

export default function PopularPage() {

  const navigate = useNavigate()

  const handleNavigateToShop = () => {
    navigate(`/shop`)
  }

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

  console.log(bestRatingProducts)

  if (isBestPending || isRatingPending) return <p>Loading...</p>;
  if (isBestError || isRatingError) return <p>Error.</p>;

  return (
    <section className="pt-[130px] h-full bg-yellow pb-[100px]  p-3 font-main">
      <div className="max-w-[1280px] bg-yellow mx-auto">
        <div>
          <h1 className="text-3xl mb-5 ">POPULAR PRODUCTS</h1>
        </div>
        <CreditPointsAuto/>
        <div className="flex flex-col gap-14">
          <div>
            <div className="mb-7 flex justify-between">
              <div className="flex items-center   gap-1 bg-card border border-black rounded-[5px]">
                <h1 className=" text-xl border-black p-2 ">
                  BEST SOLD PRODUCTS
                </h1>
                <TbPinnedFilled className="text-primary" size={25} />
              </div>
              <button onClick={handleNavigateToShop} className="text-primary underline">SEE MORE</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {bestSoldProducts.length > 0 ? (
                bestSoldProducts.map((best) => (
                  <ShopProductCards key={best._id} product={best} />
                ))
              ) : (
                <p>No product yet.</p>
              )}
            </div>
          </div>
      

        <div>
            <div className="mb-7 flex justify-between">
              <div className="flex items-center gap-1 bg-card border border-black rounded-[5px]">
                <h1 className=" text-xl p-2 ">
                  BEST RATING PRODUCT
                </h1>
                <TbPinnedFilled className="text-primary" size={25} />
              </div>
              <button onClick={handleNavigateToShop} className="text-primary underline">SEE MORE</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {bestRatingProducts.length > 0 ? (
                bestRatingProducts.map((rating) => (
                  <ShopProductCards key={rating._id} product={rating} />
                ))
              ) : (
                <p>No product yet.</p>
              )}
            </div>
          </div> 

          {/* <div>
            <div className="mb-7 flex justify-between">
              <div className="flex items-center gap-1 bg-card border border-black rounded-[5px]">
                <h1 className=" text-xl  p-2 ">
                  BEST RATING PRODUCT
                </h1>
                <TbPinnedFilled className="text-primary" size={25} />
              </div>
              <button className="text-primary underline">SEE MORE</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <ShopProductCards />
              <ShopProductCards />
              <ShopProductCards />
              <ShopProductCards />
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
