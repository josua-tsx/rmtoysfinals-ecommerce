import { useQuery } from "@tanstack/react-query";
import WishlistCard from "../components/WishlistCard.jsx";
import Buttons from "../reusable/Buttons.jsx";
import axiosInstance from "../lib/axios.js";

export default function WishListPage() {
  const {
    data: wishList = { items: [] },
    isPending,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/cart/getWishList`);
      return res.data;
    },
  });

  console.log(wishList);

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading wishlist.</div>;

  return (
    <section className="pt-[130px] font-main p-3">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex w-full  mb-5 ">
          <h1 className="text-4xl">Wishlist</h1>
        </div>

        <form className="flex flex-col md:flex-row gap-2">
          <div className=" w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 uppercase">
            {/* PRODUCTS GOES HERE */}

            {
              wishList.length > 0 ? (
                
               wishList.map((wish) => (
                <WishlistCard key={wish._id} productWish={wish} />
               ))

              ) : ""
            }

          </div>

          <div className="border md:w-[270px] h-[200px] gap-2 flex flex-col bg-card rounded-[5px] p-3 border-black">
            <h1 className="uppercase text-xl mb-3">Wishlist Summary</h1>
            <div className="flex flex-1 flex-col gap-1">
              <p>
                total items <span className="text-indigo-500">{wishList.length}</span>
              </p>
            </div>
            <div>
              <Buttons buttonName={"ADD ALL TO CART"} />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
