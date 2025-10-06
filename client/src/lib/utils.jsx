export const getGuestCart = () => {
  const cart = localStorage.getItem("guestCart");
  return cart ? JSON.parse(cart) : { items: [] };
};

export const guestSelectedCarts = () => {
  const cart = JSON.parse(localStorage.getItem("guestCart"));
  const filteredSelected = cart.items.filter((item) => item.isSelected);
  return filteredSelected;
};

export const addToGuestCart = (product) => {
  const cart = getGuestCart();

  if (!cart.items) {
    cart.items = [];
  }

  const existingItem = cart.items.find((item) => item._id === product._id);
  if (existingItem) {
    throw new Error("Product already in cart");
  }

  cart.items.push(product);
  localStorage.setItem("guestCart", JSON.stringify(cart));
  return cart;
};

export const deleteGuestCart = (productId) => {
  const cart = getGuestCart();

  const updatedItems = cart.items.filter((item) => item._id !== productId);

  const updatedCart = {
    ...cart,
    items: updatedItems,
  };

  localStorage.setItem("guestCart", JSON.stringify(updatedCart));

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

export const updateSelected = (productId, isSelected) => {
  const cart = getGuestCart();

  const existingItem = cart.items.find((item) => item._id === productId);

  if (!existingItem) throw new Error("Item does nt exist");

  const updatedCart = {
    ...cart,
    items: cart.items.map((item) =>
      item._id === productId ? { ...item, isSelected } : item
    ),
  };

  localStorage.setItem("guestCart", JSON.stringify(updatedCart));
  return updatedCart;
};

export const clearGuestOrder = () => {
  localStorage.removeItem("guestCart");
  return { items: [] };
};

// FORMAT LOCKED UNTIL

export const formatLockedUntil = (dateString) => {
  if (!dateString) return null;

  return new Date(dateString).toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
