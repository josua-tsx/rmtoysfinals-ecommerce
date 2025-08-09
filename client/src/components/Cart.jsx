import { useQuery } from "@tanstack/react-query";
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { useEffect, useState } from "react";

export default function Cart() {
  const {
    data: cart = [],
    isLoading,
    isError,
} = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/cart/get`);
      return res.data  // Ensure we always return an object with items
    },
  });
  
  if (isLoading) return <p>loading..</p>;
  if (isError) return <p>loading..</p>;

  return (
    <div className="font-main">
      <Link to={`/cart`} className="relative">
        <FaShoppingCart size={25} />

        {
          cart?.items?.length > 0 && (
            <span
            className={`absolute bg-red-600 p-2 h-[20px] flex w-[20px] text-sm text-white 
           items-center justify-center -bottom-2 -right-[9.5px] rounded-full`}
          >
            {cart?.items?.length}
          </span>
    
          )
        }
         
      </Link>
    </div>
  );
}
