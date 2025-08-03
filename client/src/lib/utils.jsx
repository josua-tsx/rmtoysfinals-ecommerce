import toast from "react-hot-toast";

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

  // Create a clean cart item with only necessary fields
  const cartItem = {
    _id: product._id,
    productId: product._id, // Keep for backward compatibility
    productName: product.productName,
    price: product.price,
    productImages: product.productImages,
    category: product.category,
    stocks: product.stocks,
    productDescription: product.productDescription,
    discount: product.discount,
    quantity: 1,
    // Add any other fields you need in your CartCard
    ...(product.productDetails && { productDetails: product.productDetails }),
    ...(product.reviews && { reviews: product.reviews }),
    ...(product.points && { points: product.points }),
  };

  cart.items.push(cartItem);
  localStorage.setItem("guestCart", JSON.stringify(cart));
  return cart;
};
