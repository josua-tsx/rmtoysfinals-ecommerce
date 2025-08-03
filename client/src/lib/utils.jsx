import toast from "react-hot-toast";

// lib/utils.js
export const getGuestCart = () => {
  const cart = localStorage.getItem("guestCart");
  return cart ? JSON.parse(cart) : { items: [] }; // Changed to 'items' to match usage
};

export const addToGuestCart = (productId) => {
  const cart = getGuestCart();

  // Ensure cart.items exists
  if (!cart.items) {
    cart.items = [];
  }

  const existingItem = cart.items.find((item) => item.productId === productId);
  if (existingItem) {
    throw new Error(toast.error("Product already in Guest Cart"));
  }

  cart.items.push({ productId });
  localStorage.setItem("guestCart", JSON.stringify(cart));
  return cart;
};
