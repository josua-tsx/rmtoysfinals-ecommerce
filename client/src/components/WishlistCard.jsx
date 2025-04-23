import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaHeart } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import formatPrice from "../reusable/formatPrice";
import { useState } from "react";
import { ConfirmModal } from "../reusable/ConfirmModal";

export default function WishlistCard({ productWish }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartId, setCartId] = useState(null);

  const queryClient = useQueryClient();

  const { mutate: removeWishMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.delete(`/wish/delete`, {
        data: { productId },
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

  const { mutate: transferToCartMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.post(`/wish/addWishToCart`, productId);
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

  const handleTransferToCart = (productId) => {
    transferToCartMutation({ productId });
  };

  const handleDeleteWish = (productId) => {
    setIsOpen(true);
    setCartId(productId);
  };

  const handleCancelDelete = () => {
    setCartId(null);
    setIsOpen(false);
  };

  const handleConfirmDelete = () => {
    if (cartId) {
      removeWishMutation(cartId);
      handleCancelDelete();
    }
  };

  return (
    <div className="border w-[220px] text-sm mx-auto md:w-full border-black bg-card relative flex justify-center items-center flex-col rounded-[5px]">
      <ConfirmModal
        isOpen={isOpen}
        title={"Confirm Delete Wish"}
        message={
          "Are you sure you want to delete this wish? This action cannot be undone."
        }
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <button
        onClick={() => handleDeleteWish(productWish?.productId._id)}
        type="button"
        className="absolute right-0 text-red-700 top-0"
      >
        <MdDelete size={25} />
      </button>

      <button type="button" className="absolute left-1 top-1">
        <FaHeart size={25} />
      </button>

      <div className="">
        <img
          src={productWish?.productId?.productImages[0]}
          className="h-[100px] w-auto object-cover"
        />
      </div>

      <div className="flex-1 p-2 border-t rounded-t-none border-black rounded-[5px] flex flex-col bg-white w-full">
        <div className="flex flex-col gap-1 justify-between">
          <h1 className="text-sm">{productWish?.productId?.productName}</h1>
          <p className="text-sm">
            {formatPrice(productWish?.productId?.price)} PHP
          </p>
        </div>
      </div>

      <button
        onClick={() => handleTransferToCart(productWish.productId._id)}
        type="button"
        className="bg-primary w-full text-card rounded-b-[5px] py-1"
      >
        TRANSFER TO CART
      </button>
    </div>
  );
}
