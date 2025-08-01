export const getGuestCart = () => {
  const cart = localStorage.getItem("guestCart");
  return cart ? JSON.parse(cart) : { item: [] };
};

export const addToGuestCart = (productId) => {
  const cart = getGuestCart();

  const existingItem = cart.items.find((item) => item.productId === productId);
  if (existingItem) {
    throw new Error("Product already in Cart");
  }

  cart.items.push({ productId });
  localStorage.setItem("guestCart", JSON.stringify(cart));
  return cart;
};
