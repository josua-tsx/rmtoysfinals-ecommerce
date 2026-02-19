import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import formatPrice from "../reusable/formatPrice";
import { useState, useEffect } from "react";
import { debounce } from "lodash"; // or your preferred debounce utility
import { ConfirmModal } from "../reusable/ConfirmModal";
import { updateCartQuantitySchema } from "../schemas/cart.schema";

export default function CartCard({ productCart }) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(productCart?.quantity || 0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCartId, setDeleteCartId] = useState(null);
  const [selected, setSelected] = useState(productCart.isSelected);

  console.log(productCart);

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

  const { mutate: updateSelectMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/cart/update-select/${productCart.productId._id}`,
        data,
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data.message);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleCheckBoxChange = (e) => {
    const newSelectionState = e.target.checked;
    setSelected(newSelectionState);

    updateSelectMutation({ isSelected: newSelectionState });
  };

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

    // Validate with Zod Schema
    const result = updateCartQuantitySchema.safeParse({ quantity: value });

    if (!result.success) {
      // If invalid, show error and don't update (or just let the input be controlled)
      // Actually we might want to allow typing but block the API call?
      // For now, let's just warn if out of bounds (1-5)
      const errorMsg = result.error.errors[0].message;
      toast.error(errorMsg);
      return;
    }

    if (!isNaN(value)) {
      setQuantity(value);
      debouncedUpdate(productCart?.productId?._id, value);
    }
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
          src={
            productCart?.productId?.productImages?.[0] ||
            "/placeholder-image.png"
          }
          alt="product images"
          className="size-[50px] border-none rounded-[5px] object-cover"
        />
        <div className="flex gap-10 justify-between items-center">
          <p>
            <span className="text-indigo-500">
              {formatPrice(productCart?.productId?.price || 0)} PHP
            </span>
          </p>
        </div>
      </div>
      <div className="flex-col gap-1 lg:flex-row justify-around lg:items-center flex  w-full">
        <h1>{productCart?.productId?.productName || "Product Unavailable"}</h1>
        <div className="my-1 flex flex-col md:flex-row md:gap-5">
          <p className="text-sm truncate w-[160px]">
            Description:{" "}
            <span className="text-indigo-500">
              {productCart?.productId?.productDescription || "No description"}
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
      <div className="flex absolute bottom-1 right-0 md:relative  gap-3">
        <button
          onClick={() => handleDeleteClick(productCart?.productId._id)}
          type="button"
          className="p-1.5 bg-red-600 text-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          <MdDelete size={22} />
        </button>
      </div>
      <div>
        <input
          type="checkbox"
          className=" h-4 w-4"
          checked={selected}
          onChange={handleCheckBoxChange}
        />
      </div>
    </div>
  );
}
