import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useOrderStore from "../stores/useOrderStore";
import { Link, useNavigate } from "react-router-dom";
import formatPrice from "../reusable/formatPrice";
import { IoIosClose } from "react-icons/io";
import LoadingSpinner from "../reusable/LoadingSpinner";
import Buttons from "../reusable/Buttons";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function OrderSummaryModal({ onClose }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [shippingFee] = useState(35);
  const [cartItems, setCartItems] = useState({});
  const [useCredits, setUseCredits] = useState("no");

  const {
    data: activeAddress,
    isPending: isActivePending,
    isError: isActiveError,
  } = useQuery({
    queryKey: ["address"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/address/get-activeAddress`);
      return res.data;
    },
  });

  const {
    data: cart = [],
    isPending: isCartPending,
    isError: isCartError,
  } = useQuery({
    queryKey: ["selectedCarts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/cart/get-selecteds`);
      return res.data;
    },
  });

  // console.log(cart);
  console.log(cartItems);
  const ROUND = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  const {
    subtotal,
    vatableSalesNet,
    vatExemptSales,
    totalVatAmount,
    totalPoints,
    totalPrice,
    shippingVat,
  } = useMemo(() => {
    // Convert shipping to number safely
    const shippingGross = Number(shippingFee || 0);

    let grossExempt = 0;
    let points = 0;
    let itemsSubtotal = 0; // sum of item prices only

    for (const item of cart || []) {
      const price = Number(item?.productId?.price || 0);
      const qty = Number(item?.quantity || 0);
      const gross = price * qty;
      const taxStatus = (item?.productId?.taxStatus || "").toLowerCase();

      itemsSubtotal += gross;
      points += Number(item?.productId?.points || 0) * qty;

      if (taxStatus !== "vatable") {
        // Exempt or zero-VAT - treat as non-taxable
        grossExempt += gross;
      }
    }

    // Shipping is VAT-exempt (not subject to VAT)

    // Calculate VAT from vatable items (VAT-inclusive pricing)
    // For each vatable item, price already includes VAT
    let totalVatableNet = 0;
    let totalVatAmount = 0;

    for (const item of cart || []) {
      const taxStatus = (item?.productId?.taxStatus || "").toLowerCase();
      if (taxStatus === "vatable") {
        const price = Number(item?.productId?.price || 0);
        const qty = Number(item?.quantity || 0);
        const gross = price * qty;

        // Get VAT rate from product, default to 12% if not found
        const vatRate = item?.productId?.vat?.vatPercent ?? 12;
        const vatFactor = 1 + vatRate / 100;

        // Calculate net and VAT (VAT-inclusive)
        const net = gross / vatFactor;
        const vat = gross - net;

        totalVatableNet += net;
        totalVatAmount += vat;
      }
    }

    // Shipping is not included in VAT calculation

    const subtotal = ROUND(itemsSubtotal);
    const totalPrice = ROUND(itemsSubtotal + shippingGross);

    return {
      subtotal,
      vatableSalesNet: ROUND(totalVatableNet),
      vatExemptSales: ROUND(grossExempt),
      totalVatAmount: ROUND(totalVatAmount),
      totalPoints: points,
      totalPrice,
    };
  }, [cart, shippingFee]);

  // Calculate credits and final totalPrice
  const { usedCredits, deductedPrice } = useMemo(() => {
    if (useCredits === "yes") {
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
  }, [useCredits, currentUser?.credits, totalPrice]);

  const handleChangeCredits = (e) => {
    setUseCredits(e.target.value);
  };

  useEffect(() => {
    if (cart) {
      setCartItems(cart);
    }
  }, [cart]);

  const { mutate: placeOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/order/place-order`, data);

      return res.data;
    },
    onSuccess: () => {
      setNotes("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`Order placed!`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const { mutate: placeStripeOrder } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/order/place-order-stripe`, data);
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      if (data.url) {
        window.location.href = data.url; // redirect to Stripe checkout
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Stripe checkout failed");
    },
  });

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

    // Check credit lock (regardless of credit usage)
    if (useCredits === "yes") {
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

    // Proceed if no lock or lock expired
    setCurrentOrder(orderData);
    navigate("/gcashQRpayment");
  };

  const handleOrderFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { fullName, phoneNumber, paymentMethod, notes, currentAddress } =
      inputs;

    if (!fullName || !phoneNumber || !currentAddress)
      return toast.error(
        "Please update required fields first in Profile -> Change Information"
      );

    // Before submitting
    if (useCredits === "yes" && currentUser?.credits <= 0) {
      toast.error("You don't have any credits available");
      return;
    }

    const orderData = {
      orderItems: cartItems,
      shippingAddress: currentAddress,
      paymentMethod,
      shippingPrice: shippingFee,
      subtotal,
      totalPrice: deductedPrice,
      notes,
      vatableSalesNet,
      vatExemptSales,
      totalVatAmount,
      quantity: cartItems.quantity,
      totalPoints,
      usedCredits: useCredits === "yes" ? usedCredits : 0,
    };

    if (paymentMethod === "Cod") {
      placeOrder(orderData);
    }

    if (paymentMethod === "GcashQR" && cartItems.length > 0) {
      handleGcashQRpaymentMethod(orderData);
    }

    if (paymentMethod === "Online Payment") {
      const stripeOrderData = {
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.productId.productName,
          productImages: item.productId.productImages[0],
          price: item.productId.price,
          quantity: item.quantity,
        })),
        shippingAddress: currentAddress,
        paymentMethod,
        shippingPrice: shippingFee,
        subtotal,
        totalPrice: deductedPrice.toString(),
        notes,
        vatableSalesNet,
        vatExemptSales,
        totalVatAmount,
        totalPoints,
        usedCredits: useCredits === "yes" ? usedCredits : 0,
      };

      placeStripeOrder(stripeOrderData);
    }
  };

  if (isActivePending || isCartPending)
    return (
      <div className="absolute inset-0 backdrop-blur-sm  z-10">
        <LoadingSpinner fullScreen />
      </div>
    );
  if (isActiveError || isCartError) return <p>error...</p>;

  return (
    <section className="fixed inset-0 overflow-y-auto flex items-center justify-center font-main z-50 backdrop-blur-sm p-4">
      <div className="bg-card border flex-col-reverse text-sm md:text-normal border-black rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex  md:flex-row">
        {/* Left Panel - Order Form */}

        <div className="w-full md:w-7/12 p-6  overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">Order Summary</h2>

            <button
              onClick={onClose}
              className="group border border-black text-white bg-red-700 rounded-[5px] p-0.5 hover:bg-red-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <IoIosClose
                size={28}
                className="group-hover:rotate-180 transition-all"
              />
            </button>
          </div>

          <form onSubmit={handleOrderFormSubmit} className="relative">
            {/* Customer Information Section */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className="text-lg mb-3">Customer Information</h3>

              <div className="bg-yellow-50 border-l-4 my-2  rounded border-red-700 p-3  text-red-700">
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
                  <label className="block text-sm  text-black mb-1">
                    Full Name
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      name="fullName"
                      className={`w-full p-2 border ${
                        currentUser?.fullName ? "" : "border-red-700"
                      } border-gray-300 outline-none rounded-md focus:ring-primary focus:border-primary`}
                      value={currentUser?.fullName || ""}
                      // disabled
                    />
                    {!currentUser?.fullName && (
                      <span className="text-sm text-red-700">
                        You don't have a full name. Update it in your profile
                        page.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm  text-black mb-1">
                    Phone Number
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="tel"
                      name="phoneNumber"
                      className={`w-full p-2 border ${
                        currentUser?.phoneNumber ? "" : "border-red-700"
                      } border-gray-300 outline-none rounded-md focus:ring-primary focus:border-primary`}
                      value={currentUser?.phoneNumber || ""}
                      // disabled
                    />
                    {!currentUser?.phoneNumber && (
                      <span className="text-sm text-red-700">
                        You don't have a phone number. Update it in your profile
                        page.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm  text-black mb-1">
                  Shipping Address
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    name="currentAddress"
                    className={`w-full p-2 border ${
                      activeAddress?.fullAddress ? "" : "border-red-700"
                    } border-gray-300 rounded-md outline-none focus:ring-primary focus:border-primary`}
                    value={activeAddress?.fullAddress || ""}
                    // disabled
                  />
                  {!activeAddress?.fullAddress && (
                    <span className="text-sm text-red-700">
                      You don't have a shipping adddress. Create a shipping
                      address in your profile page.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className=" text-lg ">Payment Method</h3>

              <select
                name="paymentMethod"
                className="w-full p-2 border outline-none border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="Cod">Cash on Delivery</option>
                <option value="GcashQR">GCash QR</option>
                <option value="Online Payment">Credit/Debit Card (TEST)</option>
              </select>
            </div>

            {/* Credits Section */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className=" text-lg mb-3">Credits</h3>

              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600">
                  Available Credits: {currentUser?.credits || 0}
                </span>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="useCredits"
                      value="yes"
                      checked={useCredits === "yes"}
                      onChange={handleChangeCredits}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="ml-2">Use Credits</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="useCredits"
                      value="no"
                      checked={useCredits === "no"}
                      onChange={handleChangeCredits}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="ml-2">Don't Use</span>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 rounded border-red-700 p-3  text-red-700">
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
                    <p className="text-sm ">
                      <strong>Note:</strong> You can only use your credits once
                      every 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-card p-4 rounded-lg">
              <label className="block text-sm  text-black mb-2">
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
            <div className="flex flex-row-reverse w-full gap-4 mt-4">
              <Buttons
                buttonType="submit"
                buttonName="Place Order"
                icon={<FaCheck size={18} />}
                animateIcon={true}
                className="flex-1 bg-[#10b981] !text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-4"
              />
              <Buttons
                buttonType="button"
                onClick={onClose}
                buttonName="Cancel"
                icon={<FaTimes size={18} />}
                animateIcon={true}
                className="px-8 bg-[#b91c1c] !text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-4"
              />
            </div>
          </form>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="w-full md:w-5/12 bg-gray-50 border border-none md:border-l-black  p-6 overflow-y-auto">
          <div className="flex justify-between items-center">
            <h3 className=" text-lg mb-4">Your Order</h3>
            <h1>Is Vatabable?</h1>
          </div>

          {/* Products List */}
          <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start border-b border-gray-200 pb-4"
                >
                  <img
                    src={item.productId.productImages[0]}
                    alt={item.productId.productName}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className=" text-gray-800">
                        {item.productId?.productName}
                      </h4>
                      <div className="flex gap-2">
                        {item.productId?.taxStatus === "vatable" ? (
                          <span className="text-green-500">Vatable</span>
                        ) : (
                          <span className="text-red-500">Exempted</span>
                        )}

                        {item?.productId?.taxStatus === "vatable" && (
                          <span className="text-blue-500">
                            - {item.productId?.vat?.vatPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Qty: {item.quantity}</span>
                      <span>
                        {formatPrice(item.productId.price * item.quantity)} PHP
                      </span>
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
                <span className="">{formatPrice(subtotal)} PHP</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Fee :</span>
                <span>{formatPrice(shippingFee)} PHP</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Vatable Sales (Net)</span>
                <span>{formatPrice(vatableSalesNet)} PHP</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">VAT Exempt Sales</span>
                <span>{formatPrice(vatExemptSales)} PHP</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total VAT Amount</span>
                <span>{formatPrice(totalVatAmount)} PHP</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Credits Used</span>
                <span className=" text-green-600">
                  {usedCredits > 0
                    ? `-${formatPrice(usedCredits)} PHP`
                    : `${formatPrice(0)} PHP`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Points Earned</span>
                <span className=" text-blue-600">+{totalPoints}</span>
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
