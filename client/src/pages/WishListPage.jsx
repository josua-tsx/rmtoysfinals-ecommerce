import { useQuery } from "@tanstack/react-query";
import WishlistCard from "../components/WishlistCard.jsx";
import Buttons from "../reusable/Buttons.jsx";
import axiosInstance from "../lib/axios.js";

export default function WishListPage() {

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

  console.log(wishlist);

  if (isPending) return <p>loading...</p>;
  if (isError) return <p>error</p>;



  return (
    <section className="pt-[130px] font-main p-3">
      <div className="max-w-[1280px] bg-yellow h-screen mx-auto">
        <div className="flex w-full  mb-5 ">
          <h1 className="text-4xl">Wishlist</h1>
        </div>

        <form className="flex flex-col md:flex-row gap-2">
          <div className=" w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1 uppercase">
            {/* PRODUCTS GOES HERE */}

              {
                wishlist?.items?.length > 0 ? (
                  wishlist?.items?.map((wish) => (
                    <WishlistCard key={wish?._id} productWish={wish} />
                  ))
                ) : (
                  <p>No wish products found.</p>
                )
              }
            
          </div>

          <div className="border md:w-[270px] h-[100px] gap-2 flex flex-col bg-card rounded-[5px] p-3 border-black">
            <h1 className="uppercase text-xl mb-3">Wishlist Summary</h1>
            <div className="flex flex-1 flex-col gap-1">
              <p>
                total items{" "}
                <span className="text-indigo-500">{wishlist?.items?.length}</span>
              </p>
            </div>
            {/* <div>
              <Buttons buttonName={"ADD ALL TO CART"} />
            </div> */}
          </div>
        </form>
      </div>
    </section>
  );
}
