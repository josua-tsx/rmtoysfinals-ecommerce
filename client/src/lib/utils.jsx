// lib/utils.js
export const getGuestCart = () => {
  const cart = localStorage.getItem("guestCart");
  return cart ? JSON.parse(cart) : { items: [] }; // Changed to 'items' to match usage
};

export const addToGuestCart = (product) => {
  const cart = getGuestCart();

  // Ensure cart.items exists
  if (!cart.items) {
    cart.items = [];
  }

  // Check if product already exists in cart
  const existingItem = cart.items.find((item) => item._id === product._id);
  if (existingItem) {
    throw new Error("Product already in cart");
  }

  cart.items.push(product);
  localStorage.setItem("guestCart", JSON.stringify(cart));
  return cart;
};

export const deleteGuestCart = (productId) => {
  // Get current cart from localStorage
  const cart = getGuestCart();

  // Filter out the item to be removed
  const updatedItems = cart.items.filter((item) => item._id !== productId);

  // Update the cart with filtered items
  const updatedCart = {
    ...cart,
    items: updatedItems,
  };

  // Save back to localStorage
  localStorage.setItem("guestCart", JSON.stringify(updatedCart));

  // Return the updated cart
  return updatedCart;
};

export const updateQuantity = (productId, newQuantity) => {
  const cart = getGuestCart();

  const updateQuantity = cart.items.findIndex((q) => q._id === productId);

  const updatedCart = {
    ...cart,
    items: cart.items.map((item, index) =>
      index === updateQuantity ? { ...item, quantity: newQuantity } : item
    ),
  };

  localStorage.setItem("guestCart", JSON.stringify(updatedCart));
  return updatedCart;
};

export const clearGuestOrder = () => {
  localStorage.removeItem("guestCart");
  return { items: [] };
};
