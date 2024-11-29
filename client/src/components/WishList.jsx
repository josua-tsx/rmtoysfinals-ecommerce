import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

export default function WishList() {
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

 

  if (isPending) return <p>loading...</p>;
  if (isError) return <p>error</p>;

  return (
    <div className="font-main">
      <Link
        to={`/wishlist`}
        onClick={() => console.log("tite")}
        className="relative"
      >
        <FaHeart size={25} />

        {wishlist?.items?.length > 0 && (
          <span className="absolute bg-red-600 p-2 h-[20px] w-[20px] text-sm text-white flex items-center justify-center -bottom-2 -right-[9.5px] rounded-full">
            {wishlist?.items?.length}
          </span>
        )}
      </Link>
    </div>
  );
}
