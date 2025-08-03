import Buttons from "../reusable/Buttons";
import CartCard from "../components/CartCard";
import { useEffect, useState } from "react";
import OrderSummaryModal from "../components/OrderSummaryModal";
import formatPrice from "../reusable/formatPrice";
import CreditPointsAuto from "../components/CreditPointsAuto";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import useOrderStore from "../stores/useOrderStore";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function GuestPage() {
  const [openOrderModal, setOrderModal] = useState(false);
  const [guestCart, setGuestCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Clear order if customer used back button
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  useEffect(() => {
    if (currentOrder) {
      clearOrder();
    }
  }, [currentOrder]);

  // Load guest cart from localStorage
  useEffect(() => {
    const loadGuestCart = () => {
      try {
        const cartData = JSON.parse(localStorage.getItem("guestCart")) || { items: [] };
        setGuestCart(cartData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading guest cart:", error);
        setGuestCart({ items: [] });
        setIsLoading(false);
      }
    };

    loadGuestCart();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = () => {
      loadGuestCart();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Calculate totals
  const totalPrice = guestCart.items?.reduce((total, item) => {
    return total + (item.productId?.price || 0) * (item.quantity || 1);
  }, 0);

  const totalPoints = guestCart.items?.reduce((total, item) => {
    return total + (item.productId?.points || 0) * (item.quantity || 1);
  }, 0);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <section className="pt-[130px] bg-yellow text-sm md:text-normal font-main p-3 min-h-screen">
      {openOrderModal && (
        <OrderSummaryModal 
          onClose={() => setOrderModal(false)} 
          cartItems={guestCart.items}
          isGuest={true}
        />
      )}

      <div className="max-w-[1280px] bg-yellow mx-auto">
        <div className="flex w-full flex-col mb-5">
          <h1 className="text-3xl md:text-4xl">Your Cart</h1>
          <p className="text-gray-600 mt-2">
            {guestCart.items.length > 1
              ? `${guestCart.items.length} items in your cart`
              : guestCart.items.length === 1
              ? "1 item in your cart"
              : "Your cart is empty"}
          </p>
          
          {/* Guest user notice */}
          {guestCart.items.length > 0 && (
            <div className="bg-blue-50 border-l-4 my-2 rounded border-blue-700 p-3 text-blue-700">
              <p className="text-sm">
                <strong>Note:</strong> You're browsing as a guest.{" "}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-600 underline"
                >
                  Sign in
                </button>{" "}
                to save your cart and access more features.
              </p>
            </div>
          )}
        </div>

        <CreditPointsAuto />

        <form className="flex flex-col md:flex-row pb-10 w-full bg-yellow gap-4">
          <div className="flex flex-col gap-3 rounded-[5px] h-[400px] md:h-[550px] overflow-y-auto md:flex-1">
            {guestCart.items.length > 0 ? (
              guestCart.items.map((item) => (
                <CartCard 
                  key={item.productId?._id || item.productId} 
                  productCart={{
                    ...item,
                    // Ensure consistent structure with authenticated cart
                    productId: typeof item.productId === 'string' 
                      ? { _id: item.productId, ...item } 
                      : item.productId
                  }} 
                  isGuest={true}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-black">
                <FaShoppingCart className="mx-auto text-4xl text-black mb-4" />
                <h3 className="text-xl font-medium text-black mb-2">
                  Your Cart is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  Add items to your cart by clicking "Add to Cart" on products.
                  They'll appear here ready for purchase.
                </p>
                <button
                  onClick={() => navigate("/shop")}
                  className="bg-primary border border-black p-2 rounded-[5px] text-white"
                >
                  Browse products
                </button>
              </div>
            )}
          </div>

          {guestCart.items.length > 0 && (
            <div className="border md:w-[270px] gap-2 flex flex-col bg-card rounded-[5px] p-6 border-black">
              <h1 className="text-xl mb-3">Order Summary</h1>
              <div className="bg-yellow-50 border-l-4 my-2 rounded border-red-700 p-3 text-red-700">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Note:</strong>
                      You can only order 5 items per product at a time.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <p>
                  Total Items: <span>{guestCart.items.length}</span>
                </p>
                <p>
                  Total Points: <span>+{totalPoints}</span>
                </p>
                <p>
                  Total Price:{" "}
                  <span className="text-indigo-500">
                    {formatPrice(totalPrice)} PHP
                  </span>
                </p>
              </div>
              <div onClick={() => setOrderModal(true)}>
                <Buttons buttonName={"Checkout"} />
              </div>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 underline mt-2 text-center"
              >
                Login to checkout with account
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}