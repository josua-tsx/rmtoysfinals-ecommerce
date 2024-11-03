import { FaCartPlus } from "react-icons/fa";
import { IoHeart } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import StarsRating from "./StarsRating";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function ShopProductCards({product}) {

  const queryClient = useQueryClient()

  const {mutate: addToCartMutation} = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/cart`, productId)
      return res.data 
    }, 
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cart']})
      toast.success("Succesfully Added to cart")
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!")
    }
  })


  const {mutate: addToWishListMutation} = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/cart/wishList`, productId)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['wishlist']})
      toast.success("Succesfully Added to Wishlist")
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!")
    }
  })


  const handleAddToCart = (productId) => {
    addToCartMutation({productId})
  }

  const handleAddToWishList = (productId) => {
    addToWishListMutation({productId})
  }


  if (!product || Object.keys(product).length === 0) {
    return <p>No product found.</p>;
}


  return (
    <div className="w-80 md:w-full h-[350px] border mx-auto font-main items-center flex flex-col justify-center group rounded-[5px] bg-card border-black shadow-md relative ">
      <div className="border p-1 text-sm z-10 bg-primary uppercase text-card font-medium absolute top-[-10px] right-[-10px] border-black rounded-[5px]">
        {
          product.category.categoryName
        }
      </div>
      <div className="w-full h-[700px] flex justify-center relative overflow-hidden group-hover:bg-primary rounded-t-[5px]">
        <img src={product.productImages} className="w-auto" />
        <div className="w-full absolute bottom-[-100%] border border-t-black transition-all group-hover:bottom-0 text-black bg-card">
          <ul className="p-2 flex flex-col gap-2">
            <li  className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <button onClick={() => handleAddToCart(product._id)}
              >ADD TO CART</button>
              <FaCartPlus size={20} />  
            </li>
            <li className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <button onClick={() => handleAddToWishList(product._id)}>
                ADD TO WISHLIST</button>
              <IoHeart size={20} />
            </li>
            <li className="border-b flex justify-between items-center border-black cursor-pointer hover:bg-gray-300 py-1">
              <Link to={`/product/${product._id}`}>VIEW DETAILS</Link>
              <FaEye size={20} />
            </li>
          </ul>
        </div>
      </div>

      <div className="p-2 flex flex-col  justify-between bg-card border-t-gray-300 border rounded-b-[5px] h-[200px]  w-full relative">
        <div className="flex w-full justify-between">
          <p>{product.productName}</p>
          <p className="uppercase">PHP{product.price}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className="w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: "blue" }}
            ></span>
            <p>BLUE</p>
          </div>

          <StarsRating rating={3}/>
        </div>
      </div>
    </div>
  );
}
