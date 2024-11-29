import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { PiShareFatFill } from "react-icons/pi";
import formatPrice from "../reusable/formatPrice";

export default function CartCard({ productCart }) {
  const queryClient = useQueryClient();

  const { mutate: removeCartMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.delete(`/cart/delete`, {
        data: productId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Sucessfully removed the cart!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const { mutate: transferToWishMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/cart/addCartToWish`, productId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(`Sucessfully transferred to cart`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const {mutate: updateQuantity} = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/cart/updateQuantity`, productId)
      return res.data
    } ,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['cart']})
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!")
    }
  })

  const handleTransferToWish = (productId) => {
    transferToWishMutation({ productId });
  };

  const handleRemoveCart = (productId) => {
    removeCartMutation({ productId });
  };

  const handleUpdateQuantity = (productId, quantity) => {
    updateQuantity({productId, quantity})
  }

  if (!productCart || Object.keys(productCart).length === 0) {
    return <p>No product found.</p>;
  }

  return (
    <div className="flex items-center gap-5 relative bg-card border-black border p-3 rounded-[5px]">
      <img
        src={productCart.productId.productImages[0]}
        alt="product images"
        className="size-[60px] border-none rounded-[5px]"
      />
      <div className="flex-col lg:flex-row justify-between  lg:items-center flex lg:gap-5 w-full ">
        <h1>{productCart.productId.productName}</h1>
        <div className="my-1 flex flex-col md:flex-row md:gap-5">
          <p className="text-sm truncate w-[160px]">
            Description: <span className="text-indigo-500">{productCart.productId.productDescription}</span>
          </p>
          {/* <p className="text-sm">
          COLOR:<span className="text-indigo-500">{color}</span>
        </p> */}
        </div>
        <div className="flex  gap-10 justify-between items-center">
          <p>
            <span className="text-indigo-500 text-xl">
              {formatPrice(productCart.productId.price)} PHP
            </span>
          </p>
         
        </div>
        <div className="flex md:flex-row items-center gap-2 relative">
            <button onClick={() => handleUpdateQuantity(productCart.productId._id, productCart.quantity - 1)}
            type="button" className="text-3xl">
              -
            </button>
            <p className="">{productCart.quantity}</p>

            <button onClick={() => handleUpdateQuantity(productCart.productId._id, productCart.quantity + 1)}
             type="button" className="text-3xl">
              +
            </button>

            <div className="absolute right-20  lg:-right-24 text-sm w-[90px]">
              (STOCKS {productCart?.productId?.stocks?.stockQuantity})
            </div>

          </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleTransferToWish(productCart.productId._id)}
            type="button"
            className="absolute flex items-center right-9 md:right-2 gap-1  text-green-600 lg:relative  "
          >
            <PiShareFatFill size={25} /> WISH
          </button>
          <button
            onClick={() => handleRemoveCart(productCart.productId._id)}
            type="button"
            className="absolute flex items-center gap-1 right-2  lg:relative text-red-600 "
          >
            <MdDelete size={25} />
          </button>
        </div>
      </div>
    </div>
  );
}
