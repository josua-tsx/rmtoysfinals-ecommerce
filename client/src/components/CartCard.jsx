import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { PiShareFatFill } from "react-icons/pi";
import formatPrice from "../reusable/formatPrice";
import { useState, useEffect } from "react";
import { debounce } from "lodash"; // or your preferred debounce utility
import { ConfirmModal } from "../reusable/ConfirmModal";

export default function CartCard({ productCart }) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(productCart?.quantity || 0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCartId, setDeleteCartId] = useState(null);

  useEffect(() => {
    setQuantity(productCart?.quantity || 0);
  }, [productCart]);

  const { mutate: removeCartMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.delete(`/cart/delete`, {
        data: { productId },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Successfully removed the cart!");
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
      toast.success(`Successfully transferred to wishlist`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const { mutate: updateQuantity } = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      const res = await axiosInstance.post(`/cart/updateQuantity`, {
        productId,
        quantity: Number(quantity),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
      // Revert to previous quantity on error
      setQuantity(productCart?.quantity || 0);
    },
  });

  const handleDeleteClick = (productId) => {
    setOpenDeleteModal(true);
    setDeleteCartId(productId);
  };

  const handleCancelDelete = () => {
    setOpenDeleteModal(false);
    setDeleteCartId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteCartId) {
      removeCartMutation(deleteCartId);
      handleCancelDelete();
    }
  };

  const debouncedUpdate = debounce((productId, quantity) => {
    if (quantity !== productCart?.quantity) {
      updateQuantity({ productId, quantity });
    }
  }, 500);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
      debouncedUpdate(productCart?.productId?._id, value);
    }
  };

  const handleTransferToWish = (productId) => {
    transferToWishMutation({ productId });
  };

  if (!productCart || Object.keys(productCart).length === 0) {
    return <p>No product found.</p>;
  }

  return (
    <div className="flex h-[150px] md:h-[120px] lg:h-[100px]  text-sm md:text-normal items-center gap-5 relative bg-card border-black border p-3 rounded-[5px]">
      <ConfirmModal
        title={"Confirm Delete Cart"}
        message={
          "Are you sure you want to delete this product in your cart? This action cannot be undone."
        }
        isOpen={openDeleteModal}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

    <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:w-[200px]">
    <img
        src={productCart.productId.productImages[0]}
        alt="product images"
        className="size-[50px] border-none rounded-[5px]"
      />
      <div className="flex gap-10 justify-between items-center">
        <p>
          <span className="text-indigo-500">
            {formatPrice(productCart?.productId?.price)} PHP
          </span>
        </p>
      </div>
    </div>
      <div className="flex-col gap-1 lg:flex-row justify-around lg:items-center flex  w-full">
        <h1>{productCart.productId.productName}</h1>
        <div className="my-1 flex flex-col md:flex-row md:gap-5">
          <p className="text-sm truncate w-[160px]">
            Description:{" "}
            <span className="text-indigo-500">
              {productCart.productId.productDescription}
            </span>
          </p>
        </div>

        <div className="flex md:flex-row items-center gap-2 relative">
          <input
            type="number"
            name="quantity"
            id="quantity"
            min={1}
            max={productCart?.productId?.stocks?.quantity}
            value={quantity === 0 ? setQuantity(1) : quantity}
            onChange={handleQuantityChange}
            className="w-14  text-center border rounded-[5px]  border-black"
          />
          <div className="text-sm w-[90px]">
            (STOCKS {productCart?.productId?.stocks?.quantity})
          </div>
        </div>
      </div>
      <div className="flex absolute bottom-1 right-0 md:relative items-center gap-3">
        <button
          onClick={() => handleTransferToWish(productCart?.productId._id)}
          type="button"
          className=" flex items-center bottom-0 right-9 md:right-2 gap-1 text-green-600 lg:relative"
        >
          <PiShareFatFill size={25} /> WISH
        </button>
        <button
          // onClick={() => handleRemoveCart(productCart.productId._id)}
          onClick={() => handleDeleteClick(productCart?.productId._id)}
          type="button"
          className=" flex items-center bottom-0 gap-1 right-2 lg:relative text-red-600"
        >
          <MdDelete size={25} />
        </button>
      </div>
    </div>
  );
}
