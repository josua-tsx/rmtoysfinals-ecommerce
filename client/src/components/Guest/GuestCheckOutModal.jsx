import { useEffect, useMemo, useState } from "react";
import { getGuestCart } from "../../lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import formatPrice from "../../reusable/formatPrice";
import useOrderStore from "../../stores/useOrderStore";
import { useUserStore } from "../../stores/useUserStore";

export default function GuestCheckOutModal({ onClose }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [taxes, setTaxes] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(35);
  const [cartItems, setCartItems] = useState({});
  const [useCredits, setUseCredits] = useState("no");
  const [isGuest, setIsGuest] = useState(!currentUser); // Determine if guest checkout
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [cart, setCart] = useState(getGuestCart());

  // Calculate all cart values
  const { totalDiscount, subtotal, totalPoints, totalPrice } = useMemo(() => {
    const totalDiscount =
      cart?.items?.reduce((total, item) => {
        const productDiscount = item.discount || 0;
        return total + productDiscount * item.quantity;
      }, 0) || 0;

    const subtotal =
      cart?.items?.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0) || 0;

    const totalPoints =
      cart?.items?.reduce((total, item) => {
        return total + item.points * item.quantity;
      }, 0) || 0;

    const totalPrice = subtotal - totalDiscount + shippingFee;

    return { totalDiscount, subtotal, totalPoints, totalPrice };
  }, [cart, shippingFee]);

  // Calculate credits and final totalPrice (only for authenticated users)
  const { usedCredits, deductedPrice } = useMemo(() => {
    if (!isGuest && useCredits === "yes") {
      const creditsToUse = Math.min(currentUser?.credits || 0, totalPrice);
      return {
        usedCredits: creditsToUse,
        deductedPrice: totalPrice - creditsToUse,
      };
    }
    return {
      usedCredits: 0,
      deductedPrice: totalPrice,
    };
  }, [useCredits, currentUser?.credits, totalPrice, isGuest]);

  const handleChangeCredits = (e) => {
    if (!isGuest) { // Only allow credit usage for authenticated users
      setUseCredits(e.target.value);
    }
  };

  const handleGuestInfoChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (cart) {
      setCartItems(cart.items);
    }
    setIsGuest(!currentUser); // Update isGuest when currentUser changes
  }, [cart, currentUser]);

  const handleGcashQRpaymentMethod = (orderData) => {
    if (!orderData.orderItems?.length) {
      toast.error("Your cart is empty");
      return;
    }

    // Validate all items before proceeding
    for (const item of orderData.orderItems) {
      if (item.quantity > 5) {
        toast.error("You can only order up to 5 items per product at a time.");
        return;
      }
    }

    // Check credit lock only for authenticated users
    if (!isGuest && useCredits === "yes") {
      if (currentUser.creditLock) {
        const now = new Date();
        const lockExpiry = new Date(currentUser.creditLock);

        if (lockExpiry > now) {
          const expiryDate = lockExpiry.toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          toast.error(`⏳ Credits locked until ${expiryDate}`);
          return;
        }
      }
    }

    // Add guest info if this is a guest order
    if (isGuest) {
      orderData.guestUser = guestInfo;
    }

    setCurrentOrder(orderData);
    navigate("/gcashQRpayment");
  };

  const handleOrderFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { paymentMethod, notes, currentAddress } = inputs;

    // For guest orders, validate guest info
    if (isGuest) {
      if (!guestInfo.name || !guestInfo.phone || !currentAddress) {
        return toast.error("Please fill in all required fields");
      }
      
      // Simple email validation
      if (!/^\S+@\S+\.\S+$/.test(guestInfo.email)) {
        return toast.error("Please enter a valid email address");
      }
    } 
    // For authenticated users, validate user info
    else if (!currentUser?.phoneNumber || !currentAddress) {
      return toast.error(
        "Please update required fields first in Profile -> Change Information"
      );
    }

    // Before submitting - only check credits for authenticated users
    if (!isGuest && useCredits === "yes" && currentUser?.credits <= 0) {
      toast.error("You don't have any credits available");
      return;
    }

    const orderData = {
      orderItems: cartItems,
      shippingAddress: currentAddress,
      paymentMethod,
      taxPrice: taxes,
      shippingPrice: shippingFee,
      discount: totalDiscount,
      subtotal,
      totalPrice: deductedPrice,
      notes,
      quantity: cartItems.quantity,
      totalPoints,
      usedCredits: !isGuest && useCredits === "yes" ? usedCredits : 0,
      isGuest,
    };

    // Add guest info if this is a guest order
    if (isGuest) {
      orderData.guestUser = guestInfo;
    }

    if (paymentMethod === "GcashQR" && cartItems.length > 0) {
      handleGcashQRpaymentMethod(orderData);
    }

    if (paymentMethod === "Online Payment") {
      const stripeOrderData = {
        ...orderData,
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImages: item.productImages[0],
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice: deductedPrice.toString(),
      };

      // placeStripeOrder(stripeOrderData);
    }
  };

  return (
    <section className="fixed inset-0 overflow-y-auto flex items-center justify-center font-main z-50 backdrop-blur-sm p-4">
      <div className="bg-card border flex-col-reverse text-sm md:text-normal border-black rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex md:flex-row">
        {/* Left Panel - Order Form */}
        <div className="w-full md:w-7/12 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">Order Summary</h2>
            <button
              onClick={onClose}
              className="border border-black text-card bg-red-700 rounded-[5px] px-5 right-0 -top-8"
            >
              <IoIosClose size={25} />
            </button>
          </div>

          <form onSubmit={handleOrderFormSubmit} className="relative">
            {/* Customer Information Section */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className="text-lg mb-3">Customer Information</h3>

              {isGuest ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-black mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={guestInfo.name}
                        onChange={handleGuestInfoChange}
                        className="p-2 rounded-[5px] border border-gray-300 w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-black mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={guestInfo.email}
                        onChange={handleGuestInfoChange}
                        className="p-2 border border-gray-300 rounded-[5px] w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm text-black mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={guestInfo.phone}
                      onChange={handleGuestInfoChange}
                      className="p-2 border border-gray-300 rounded-[5px] w-full"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
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
                          To be able to place an order you must update required
                          information in your profile page.
                          <span>
                            {" "}
                            <Link
                              to={"/profile"}
                              className="underline text-blue-700"
                            >
                              Click here!
                            </Link>{" "}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-black mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={currentUser?.name || ""}
                        className="p-2 rounded-[5px] border border-gray-300 w-full bg-gray-100"
                        disabled
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-black mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={currentUser?.phoneNumber || ""}
                        className="p-2 border border-gray-300 rounded-[5px] w-full bg-gray-100"
                        disabled
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mt-3">
                <label className="block text-sm text-black mb-1">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="currentAddress"
                  className="p-2 border border-gray-300 rounded-[5px] w-full"
                  required
                />
              </div>
            </div>

            {/* Credit Usage (only for authenticated users) */}
            {!isGuest && (
              <div className="bg-card p-4 rounded-lg">
                <h3 className="text-lg mb-2">Use Credits</h3>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="useCredits"
                      value="no"
                      checked={useCredits === "no"}
                      onChange={handleChangeCredits}
                      className="form-radio"
                    />
                    <span className="ml-2">No</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="useCredits"
                      value="yes"
                      checked={useCredits === "yes"}
                      onChange={handleChangeCredits}
                      className="form-radio"
                    />
                    <span className="ml-2">Yes</span>
                  </label>
                </div>
                {useCredits === "yes" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Available credits: {formatPrice(currentUser?.credits || 0)} PHP
                  </p>
                )}
              </div>
            )}

            {/* Payment Method Section */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className="text-lg mb-2">Payment Method</h3>
              <select
                name="paymentMethod"
                className="w-full p-2 border outline-none border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="GcashQR">GCash QR</option>
                <option value="Online Payment">Credit/Debit Card (TEST)</option>
              </select>
            </div>

            {/* Additional Notes */}
            <div className="bg-card p-4 rounded-lg">
              <label className="block text-sm text-black mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 resize-none rounded-md outline-none focus:ring-primary focus:border-primary"
                rows="3"
                placeholder="Special instructions, delivery notes, etc."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row-reverse w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-black bg-red-700 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 flex-1 border border-black bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {isGuest ? "Continue as Guest" : "Place Order"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="w-full md:w-5/12 bg-gray-50 border border-none md:border-l-black p-6 overflow-y-auto">
          <h3 className="text-lg mb-4">Your Order</h3>

          {/* Products List */}
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
            {cart?.items?.length > 0 ? (
              cart.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start border-b border-gray-200 pb-4"
                >
                  <img
                    src={item.productImages[0]}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="text-gray-800">{item.productName}</h4>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)} PHP</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No items in cart</p>
            )}
          </div>

          {/* Order Totals */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)} PHP</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee</span>
                <span>{shippingFee} PHP</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">
                  -{formatPrice(totalDiscount)} PHP
                </span>
              </div>

              {!isGuest && useCredits === "yes" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Used</span>
                  <span className="text-green-600">
                    -{formatPrice(usedCredits)} PHP
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Points Earned</span>
                <span className="text-blue-600">+{totalPoints}</span>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(deductedPrice)} PHP</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>
                * Shipping fees are not included in the subtotal and must be
                paid upon delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}