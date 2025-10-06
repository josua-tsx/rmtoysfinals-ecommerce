import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import { MdDelete } from "react-icons/md";

import formatPrice from "../../reusable/formatPrice";
import {
  deleteGuestCart,
  updateQuantity,
  updateSelected,
} from "../../lib/utils";
import toast from "react-hot-toast";

export default function GuestCard({ productCart, refreshCart }) {
  const [quantity, setQuantity] = useState(1);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [cart, setCart] = useState(null);
  const [selected, setSelected] = useState(productCart.isSelected);

  useEffect(() => {
    if (productCart) {
      setCart(productCart);
      setQuantity(productCart.quantity || 1);
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
    <div className="flex h-[150px] md:h-[120px] lg:h-[100px] text-sm md:text-normal items-center gap-5 relative bg-card border-black border p-3 rounded-[5px]">
      <ConfirmModal
        title={"Confirm Delete Cart"}
        message={
          "Are you sure you want to delete this product in your cart? This action cannot be undone."
        }
        isOpen={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          handleRemoveItem(cart._id);
          setOpenDeleteModal(false);
        }}
      />

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:w-[200px]">
        <img
          src={cart.productImages?.[0] || "/placeholder-image.jpg"}
          alt="product"
          className="size-[50px] border-none rounded-[5px]"
        />
        <div className="flex gap-10 justify-between items-center">
          <p>
            <span className="text-indigo-500">
              {formatPrice(cart.price)} PHP
            </span>
          </p>
        </div>
      </div>

      <div className="flex-col gap-1 lg:flex-row justify-around lg:items-center flex w-full">
        <h1>{cart.productName}</h1>
        <div className="my-1 flex flex-col md:flex-row md:gap-5">
          <p className="text-sm truncate w-[160px]">
            Description:{" "}
            <span className="text-indigo-500">
              {cart.productDescription || "No description"}
            </span>
          </p>
        </div>

        <div className="flex md:flex-row items-center gap-2 relative">
          <input
            type="number"
            name="quantity"
            id="quantity"
            min={1}
            max={cart.stocks?.quantity || 10}
            value={quantity}
            onChange={(e) => {
              const newQuantity = Math.max(
                1,
                Math.min(
                  parseInt(e.target.value) || 1,
                  cart.stocks?.quantity || 10
                )
              );
              handleUpdateQuantity(newQuantity);
            }}
            className="w-14 text-center border rounded-[5px] border-black"
          />
          <div className="text-sm w-[90px]">
            (STOCKS {cart.stocks?.quantity || "N/A"})
          </div>
        </div>
      </div>

      <div className="flex  bottom-1 right-1 md:relative items-center gap-3">
        <button
          onClick={() => setOpenDeleteModal(true)}
          type="button"
          className="flex items-center bottom-0 gap-1 right-2 lg:relative text-red-600"
        >
          <MdDelete size={25} />
        </button>
      </div>
      <div>
        <input
          type="checkbox"
          className=" h-4 w-4"
          onClick={() => console.log(productCart)}
          checked={selected}
          onChange={handleCheckBoxChange}
        />
      </div>
    </div>
  );
}
