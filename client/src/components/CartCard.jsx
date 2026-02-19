import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import formatPrice from "../reusable/formatPrice";
import { useState, useEffect } from "react";
import { debounce } from "lodash"; // or your preferred debounce utility
import { ConfirmModal } from "../reusable/ConfirmModal";
import { updateCartQuantitySchema } from "../schemas/cart.schema";
import { FaMinus, FaPlus } from "react-icons/fa";

export default function CartCard({ productCart }) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(productCart?.quantity || 0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteCartId, setDeleteCartId] = useState(null);
  const [selected, setSelected] = useState(productCart.isSelected);

  const productId = productCart?.productId?._id;
  const maxStock = productCart?.productId?.stocks?.quantity || 0;

  useEffect(() => {
    setQuantity(productCart?.quantity || 0);
    setSelected(productCart.isSelected);
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
      toast.success("Item removed from cart");
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
        `/cart/update-select/${productId}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => {
      toast.error(err.response.data.message);
      // Revert selection on error
      setSelected(!selected);
    },
  });

  const handleCheckBoxChange = (e) => {
    const newSelectionState = e.target.checked;
    setSelected(newSelectionState);
    updateSelectMutation({ isSelected: newSelectionState });
  };

  const handleDeleteClick = () => {
    setOpenDeleteModal(true);
    setDeleteCartId(productId);
  };

  const handleConfirmDelete = () => {
    if (deleteCartId) {
      removeCartMutation(deleteCartId);
      setOpenDeleteModal(false);
      setDeleteCartId(null);
    }
  };

  const debouncedUpdate = debounce((pid, qty) => {
    if (qty !== productCart?.quantity) {
      updateQuantity({ productId: pid, quantity: qty });
    }
  }, 500);

  const updateQuantityValue = (newVal) => {
    // Validate bounds
    if (newVal < 1) newVal = 1;
    if (newVal > maxStock) {
      toast.error(`Only ${maxStock} items available`);
      newVal = maxStock;
    }

    // Validate Schema
    const result = updateCartQuantitySchema.safeParse({ quantity: newVal });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setQuantity(newVal);
    debouncedUpdate(productId, newVal);
  };

  const increment = () => updateQuantityValue(quantity + 1);
  const decrement = () => updateQuantityValue(quantity - 1);

  const handleManualInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      updateQuantityValue(val);
    }
  };

  if (!productCart || !productCart.productId) return null;

  return (
    <div
      className={`relative flex flex-col md:flex-row items-center gap-3 bg-white border border-black p-3 rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${selected ? "bg-blue-50" : ""}`}
    >
      <ConfirmModal
        title={"Remove Item"}
        message="Are you sure you want to remove this item from your cart?"
        isOpen={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Selection Checkbox */}
      <div className="absolute top-2 left-2 md:static md:self-center">
        <input
          type="checkbox"
          className="w-4 h-4 accent-indigo-600 border-2 border-black rounded focus:ring-offset-1 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          checked={selected}
          onChange={handleCheckBoxChange}
        />
      </div>

      {/* Product Image */}
      <div className="w-full md:w-auto flex justify-center md:block pl-6 md:pl-0">
        <img
          src={
            productCart.productId.productImages?.[0] || "/placeholder-image.png"
          }
          alt={productCart.productId.productName}
          className="w-16 h-16 md:w-20 md:h-20 object-cover border-2 border-black rounded-[5px] bg-gray-100"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 w-full flex flex-col gap-1 md:pl-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base md:text-lg uppercase leading-tight tracking-tight text-gray-900 line-clamp-1">
            {productCart.productId.productName}
          </h3>
          <button
            onClick={handleDeleteClick}
            className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
            title="Remove item"
          >
            <MdDelete size={20} />
          </button>
        </div>

        <p className="text-xs text-gray-600 line-clamp-1">
          {productCart.productId.productDescription ||
            "No description available"}
        </p>

        <div className="mt-1 flex items-center justify-between flex-wrap gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Unit Price
            </span>
            <span className="text-base font-black text-indigo-600">
              {formatPrice(productCart.productId.price)}{" "}
              <span className="text-[10px] text-black">PHP</span>
            </span>
          </div>

          {/* Quantity Control */}
          <div className="flex flex-col items-end md:items-start gap-0.5">
            <div className="flex items-center border-2 border-black rounded-[5px] bg-white overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] h-8">
              <button
                onClick={decrement}
                disabled={quantity <= 1}
                className="px-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-r-2 border-black transition-colors h-full flex items-center"
              >
                <FaMinus size={8} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleManualInput}
                className="w-10 text-center font-bold text-sm focus:outline-none appearance-none bg-transparent h-full"
              />
              <button
                onClick={increment}
                disabled={quantity >= maxStock}
                className="px-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-l-2 border-black transition-colors h-full flex items-center"
              >
                <FaPlus size={8} />
              </button>
            </div>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              {maxStock} Stocks Left
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
