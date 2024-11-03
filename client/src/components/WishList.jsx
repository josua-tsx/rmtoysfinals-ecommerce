import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

export default function WishList() {
  const {
    data: wishlist = { items: [] },
    isPending,
    isError,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/cart/getWishList`);
      return res.data;
    },
  });

  console.log(wishlist);

  if (isPending) return <p>loading..</p>;
  if (isError) return <p>loading..</p>;

  return (
    <div className="font-main">
      <Link
        to={`/wishlist`}
        onClick={() => console.log("tite")}
        className="relative"
      >
        <FaHeart size={25} />

        {wishlist.length > 0 && (
          <span className="absolute bg-red-600 p-2 h-[20px] w-[20px] text-sm text-white flex items-center justify-center -bottom-2 -right-[9.5px] rounded-full">
            {wishlist.length}
          </span>
        )}
      </Link>
    </div>
  );
}
