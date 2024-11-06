import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function WishlistCard({productWish}) {

  console.log(productWish)

  const queryClient = useQueryClient();

  const { mutate: removeWishMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.delete(`/wish/delete`, {
        data: productId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Sucessfully removed the cart!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });


  const {mutate: transferToCartMutation} = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/wish/addWishToCart`, productId)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cart']})
      queryClient.invalidateQueries({queryKey: ['wishlist']})
      toast.success(`Sucessfully transferred to cart`)
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong")
    }
  })

  const handleRemoveWish = (productId) => {
    removeWishMutation({ productId });
  };

  const handleTransferToCart = (productId) => {
    transferToCartMutation({ productId });
  };


  return (
    <div className="border w-[253px] mx-auto md:w-full border-black bg-card relative flex justify-center items-center flex-col rounded-[5px]">
      <button onClick={() => handleRemoveWish(productWish.productId._id)}
      type="button" className="absolute right-0 text-red-700 top-0">
        <MdDelete size={25} />
      </button>

      <button type="button" className="absolute left-1 top-1">
        <FaHeart size={25} />
      </button>

      <div className="">
        <img
          src={productWish?.productId?.productImages[0]}
          className="h-[150px] w-auto object-cover"
        />
      </div>

      <div className="flex-1 p-2 border-t rounded-t-none border-black rounded-[5px] flex flex-col bg-white w-full">
        <div className="flex flex-col gap-2 justify-between">
          <h1 className="text-sm">{productWish?.productId?.productName}</h1>
          <p className="text-sm">{productWish?.productId?.price} PHP</p>
        </div>
      </div>

      <button onClick={() => handleTransferToCart(productWish.productId._id)}
      type="button"
      className="bg-primary w-full text-card rounded-b-[5px] py-1">
        TRANSFER TO CART
      </button>
    </div>
  );
}
