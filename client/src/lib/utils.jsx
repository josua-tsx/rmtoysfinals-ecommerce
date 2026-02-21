export const getGuestCart = () => {
  const raw = localStorage.getItem("guestCart");
  let parsed;

  try {
    parsed = raw ? JSON.parse(raw) : { items: [] };
  } catch (error) {
    console.error("🧨 Error parsing guestCart:", error);
    parsed = { items: [] };
  }

  // 🧩 Fix corrupted cases (like arrays with an items prop)
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    console.warn("⚠️ guestCart was not an object. Resetting.");
    parsed = { items: [] };
  }

  if (!Array.isArray(parsed.items)) {
    parsed.items = [];
  }

  return parsed;
};

export const addToGuestCart = (product) => {
  // Always start with an object
  const cart = getGuestCart();

  if (!cart.items) {
    cart.items = [];
  }

  // Prevent duplicates
  const existingItem = cart.items.find((item) => item._id === product._id);
  if (existingItem) {
    throw new Error("Product already in cart");
  }

  // Add product
  cart.items.push(product);

  // ✅ Save as an object (not an array!)
  localStorage.setItem("guestCart", JSON.stringify(cart));

  console.log("✅ guestCart saved (object):", cart);
  return cart;
};

export const guestSelectedCarts = () => {
  const cart = getGuestCart();
  return cart.items.filter((item) => item.isSelected);
};

export const deleteGuestCart = (productId) => {
  const cart = getGuestCart();

  const cartInItems = cart.items;

  if (cartInItems) {
    for (const c of cartInItems) {
      if (c._id.toString() === productId && c.isSelected) {
        throw new Error(
          "You can not delete this cart since it is checked. try to uncheck it first",
        );
      }
    }
  }

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
      index === updateQuantity ? { ...item, quantity: newQuantity } : item,
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
      item._id === productId ? { ...item, isSelected } : item,
    ),
  };

  localStorage.setItem("guestCart", JSON.stringify(updatedCart));
  return updatedCart;
};

export const clearGuestOrder = () => {
  const cart = getGuestCart();
  if (!cart.items || cart.items.length === 0) {
    return { items: [] };
  }
  const remainingItems = cart.items.filter((item) => !item.isSelected);
  const updatedCart = {
    ...cart,
    items: remainingItems,
  };
  localStorage.setItem("guestCart", JSON.stringify(updatedCart));
  return updatedCart;
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
