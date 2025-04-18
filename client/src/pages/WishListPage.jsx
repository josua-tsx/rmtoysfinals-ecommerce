import { useQuery } from "@tanstack/react-query";
import WishlistCard from "../components/WishlistCard.jsx";
import axiosInstance from "../lib/axios.js";
import { FaHeart } from "react-icons/fa";
import CreditPointsAuto from "../components/CreditPointsAuto.jsx";
import { useNavigate } from "react-router-dom";

export default function WishListPage() {

  const navigate = useNavigate()

  const {
    data: wishlist = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/wish/get`);
      return res.data;
    },
  });

  if (isPending) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (isError) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-red-500">Error loading wishlist</p>
    </div>
  );

  return (
    <section className="pt-[130px] text-sm md:text-normal bg-yellow min-h-screen font-main">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl  text-gray-900 flex items-center">
            {/* <FiHeart className="mr-3 text-indigo-600" /> */}
            My Wishlist
          </h1>
          <p className="text-gray-600 mt-2">
            {wishlist?.items?.length > 1 ? wishlist?.items?.length + " items saved for later" : wishlist?.items?.length + " item saved for later" } 
          </p>
        </div>

        <CreditPointsAuto/>

        <div className="flex flex-col  lg:flex-row gap-6">
          <div className="flex-1">
            {wishlist?.items?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlist.items.map((wish) => (
                  <WishlistCard key={wish?._id} productWish={wish} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-black">
                <FaHeart className="mx-auto text-4xl text-black mb-4" />
                <h3 className="text-xl font-medium text-black mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-4">Save your favorite items here for easy access</p>
                <button onClick={() => navigate("/shop")} 
                className="bg-primary border border-black p-2 rounded-[5px] text-white">
                  Browse products
                </button>
              </div>
            )}
          </div>

          {wishlist?.items?.length > 0 && (
            <div className="w-full p-3 lg:w-80">
              <div className="bg-card rounded-lg shadow-sm border border-black p-6">
                <h2 className="text-xl text-gray-900 mb-6 flex items-center">
                  <FaHeart className="mr-2 text-black" />
                  Wishlist Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="">Items</span>
                    <span className="font-medium">{wishlist?.items?.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}