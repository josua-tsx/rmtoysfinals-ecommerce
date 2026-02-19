import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import { MdDelete } from "react-icons/md";
import { FaMinus, FaPlus } from "react-icons/fa";

import formatPrice from "../../reusable/formatPrice";
import {
  deleteGuestCart,
  updateQuantity,
  updateSelected,
} from "../../lib/utils";
import toast from "react-hot-toast";
import { updateCartQuantitySchema } from "../../schemas/cart.schema";

export default function GuestCard({ productCart, refreshCart }) {
  const [quantity, setQuantity] = useState(1);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [cart, setCart] = useState(null);
  const [selected, setSelected] = useState(productCart.isSelected);

  const maxStock = cart?.stocks?.quantity || 0;

  useEffect(() => {
    if (productCart) {
      setCart(productCart);
      setQuantity(productCart.quantity || 1);
      setSelected(productCart.isSelected);
    }
  }, [productCart]);

  const handleRemoveItem = (productId) => {
    try {
      const updatedCart = deleteGuestCart(productId);
      refreshCart();
      toast.success("Item removed from cart", updatedCart);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateQuantity = (newQuantity) => {
    try {
      setQuantity(newQuantity);
      updateQuantity(cart._id, newQuantity);
      refreshCart();
    } catch (error) {
      toast.error(error.message);
      setQuantity(cart.quantity || 1);
    }
  };

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

    handleUpdateQuantity(newVal);
  };

  const increment = () => updateQuantityValue(quantity + 1);
  const decrement = () => updateQuantityValue(quantity - 1);

  const handleManualInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      updateQuantityValue(val);
    }
  };

  const handleCheckBoxChange = (e) => {
    const newSelection = e.target.checked;
    setSelected(newSelection);

    updateSelected(productCart._id, newSelection);
    refreshCart();
  };

  if (!cart || Object.keys(cart).length === 0) {
    return <p>No product found.</p>;
  }

  return (
    <div
      className={`relative flex flex-col md:flex-row items-center gap-3 bg-white border border-black p-3 rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${selected ? "bg-blue-50" : ""}`}
    >
      <ConfirmModal
        title={"Remove Item"}
        message={"Are you sure you want to remove this item from your cart?"}
        isOpen={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          handleRemoveItem(cart._id);
          setOpenDeleteModal(false);
        }}
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
          src={cart.productImages?.[0] || "/placeholder-image.jpg"}
          alt="product"
          className="w-16 h-16 md:w-20 md:h-20 object-cover border-2 border-black rounded-[5px] bg-gray-100"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 w-full flex flex-col gap-1 md:pl-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base md:text-lg uppercase leading-tight tracking-tight text-gray-900 line-clamp-1">
            {cart.productName}
          </h3>
          <button
            onClick={() => setOpenDeleteModal(true)}
            className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
            title="Remove item"
          >
            <MdDelete size={20} />
          </button>
        </div>

        <p className="text-xs text-gray-600 line-clamp-1">
          {cart.productDescription || "No description available"}
        </p>

        <div className="mt-1 flex items-center justify-between flex-wrap gap-2">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Unit Price
            </span>
            <span className="text-base font-black text-indigo-600">
              {formatPrice(cart.price)}{" "}
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
