import { useEffect, useMemo, useState } from "react";
import { guestSelectedCarts } from "../../lib/utils";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import formatPrice from "../../reusable/formatPrice";
import useOrderStore from "../../stores/useOrderStore";
import axiosInstance from "../../lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ValidatedInput from "../../reusable/ValidatedInput";
import {
  emailSchema,
  fullNameSchema,
  phMobileSchema,
} from "../../schemas/common.schema";

// Guest Order Schema
const guestOrderSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phoneNumber: phMobileSchema,
  currentAddress: z
    .string()
    .min(5, "Address MUST be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),
  paymentMethod: z.enum(["GcashQR", "Online Payment"]),
  notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
});

export default function GuestSummaryModal({ onClose }) {
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const navigate = useNavigate();
  // const [notes, setNotes] = useState(""); // Managed by RHF now
  const [taxes, setTaxes] = useState(0);
  const [shippingFee, setShippingFee] = useState(35);
  const [cartItems, setCartItems] = useState([]);
  const [cart, setCart] = useState(guestSelectedCarts());

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(guestOrderSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      currentAddress: "",
      paymentMethod: "GcashQR",
      notes: "",
    },
  });

  const ROUND = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  const {
    subtotal,
    vatableSalesNet,
    vatExemptSales,
    totalVatAmount,
    totalPoints,
    totalPrice,
  } = useMemo(() => {
    // Convert shipping to number safely
    const shippingGross = Number(shippingFee || 0);

    let grossExempt = 0;
    let points = 0;
    let itemsSubtotal = 0; // sum of item prices only

    for (const item of cart || []) {
      const price = Number(item?.price || 0);
      const qty = Number(item?.quantity || 0);
      const gross = price * qty;
      const taxStatus = (item?.taxStatus || "").toLowerCase();

      itemsSubtotal += gross;
      points += Number(item?.points || 0) * qty;

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
      const taxStatus = (item?.taxStatus || "").toLowerCase();
      if (taxStatus === "vatable") {
        const price = Number(item?.price || 0);
        const qty = Number(item?.quantity || 0);
        const gross = price * qty;

        // Get VAT rate from product, default to 12% if not found
        const vatRate = item?.vat?.vatPercent ?? 12;
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

  console.log(currentOrder);

  useEffect(() => {
    if (cart) {
      setCartItems(cart);
    }
  }, [cart]);

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

  const handleGcashQRpaymentMethod = async (orderData) => {
    if (orderData.orderItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const res = await axiosInstance.post("/order/validate-guest", orderData);

      if (res.status === 200) {
        // Proceed if no lock or lock expired
        localStorage.setItem("manual-order-backup", JSON.stringify(orderData));
        setCurrentOrder(orderData);
        navigate("/payment-gcash");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const onOrderSubmit = (data) => {
    const {
      fullName,
      email,
      phoneNumber,
      currentAddress,
      paymentMethod,
      notes,
    } = data;

    const orderData = {
      orderItems: cartItems?.map((item) => ({
        productId: {
          _id: item._id,
          productName: item.productName,
          productDescription: item.productDescription,
          productImages: item.productImages,
          stocks: item.stocks,
          price: item.price,
        },
        quantity: item.quantity,
      })),
      shippingAddress: currentAddress,
      isGuest: true,
      guestUser: {
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim(),
      },
      paymentMethod,
      taxPrice: taxes,
      shippingPrice: shippingFee,
      vatableSalesNet,
      vatExemptSales,
      totalVatAmount,
      subtotal,
      totalPrice: totalPrice,
      notes,
      quantity: cartItems?.quantity,
      totalPoints,
    };

    if (paymentMethod === "GcashQR" && cartItems.length > 0) {
      handleGcashQRpaymentMethod(orderData);
      console.log(orderData);
    }

    if (paymentMethod === "Online Payment") {
      const stripeOrderData = {
        orderItems: cartItems.map((item) => ({
          // For backend processing
          productId: {
            _id: item._id,
            productName: item.productName,
            price: item.price,
          },
          // For Stripe line items
          _id: item._id,
          productName: item.productName,
          productImages: item.productImages,
          price: item.price,
          quantity: item.quantity,
        })),
        isGuest: true,
        guestUser: {
          name: fullName.trim(),
          phone: phoneNumber.trim(),
          email: email.trim(),
        },
        shippingAddress: currentAddress,
        paymentMethod,
        taxPrice: taxes,
        shippingPrice: shippingFee,
        vatableSalesNet,
        vatExemptSales,
        totalVatAmount,
        subtotal,
        totalPrice: totalPrice.toString(),
        notes: notes || "",
        totalPoints,
        usedCredits: 0, // Explicitly set for guest checkout
      };

      console.log("Sending to Stripe:", stripeOrderData);
      placeStripeOrder(stripeOrderData);
    }
  };

  return (
    <section className="fixed inset-0 overflow-y-auto flex items-center justify-center font-main z-50 backdrop-blur-sm p-4">
      <div className="bg-card border flex-col-reverse text-sm md:text-normal border-black rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex  md:flex-row">
        {/* Left Panel - Order Form */}

        <div className="w-full md:w-7/12 p-6  overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">Order Summary</h2>

            <button
              onClick={onClose}
              className="group border-2 border-black text-white bg-red-700 rounded-[5px] p-0.5 hover:bg-red-800 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <IoIosClose size={28} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onOrderSubmit)} className="relative">
            {/* Customer Information Section */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className="text-lg mb-3">Customer Information</h3>

              <div className="my-3">
                <ValidatedInput
                  label="Email"
                  id="email"
                  type="email"
                  {...register("email")}
                  error={errors.email}
                  placeholder="Ex: user@example.com"
                  maxLength={254}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ValidatedInput
                    label="Full Name"
                    id="fullName"
                    {...register("fullName")}
                    error={errors.fullName}
                    placeholder="Ex: Juan Dela Cruz"
                    maxLength={80}
                  />
                </div>

                <div>
                  <ValidatedInput
                    label="Phone Number"
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    error={errors.phoneNumber}
                    placeholder="Ex: 09xxxxxxxxx"
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="mt-3">
                <ValidatedInput
                  label="Shipping Address"
                  id="currentAddress"
                  {...register("currentAddress")}
                  error={errors.currentAddress}
                  placeholder="Complete Address"
                  maxLength={200}
                />
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-card p-4 rounded-lg">
              <h3 className=" text-lg ">Payment Method</h3>

              <select
                {...register("paymentMethod")}
                className="w-full p-2 border outline-none border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              >
                <option value="GcashQR">GCash QR</option>
                <option value="Online Payment">Credit/Debit Card (TEST)</option>
              </select>
              {errors.paymentMethod && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-card p-4 rounded-lg">
              <label className="block text-sm  text-black mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                {...register("notes")}
                className="w-full p-2 border border-gray-300 resize-none rounded-md outline-none focus:ring-primary focus:border-primary"
                rows="3"
                maxLength={200}
                placeholder="Special instructions, delivery notes, etc."
              ></textarea>
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.notes.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row-reverse w-full gap-4 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 border-2 border-black bg-[#10b981] text-white rounded-[5px] font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95 transition-all outline-none disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 border-2 border-black bg-[#b91c1c] text-white rounded-[5px] font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:scale-95 transition-all outline-none"
              >
                Cancel
              </button>
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
            {cart?.length > 0 ? (
              cart.map((item) => (
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
                    <div className="flex justify-between">
                      <h4 className=" text-gray-800">{item.productName}</h4>
                      <div className="flex gap-2">
                        {item.taxStatus === "vatable" ? (
                          <span className="text-green-500">Vatable</span>
                        ) : (
                          <span className="text-red-500">Exempted</span>
                        )}

                        {item?.taxStatus === "vatable" && (
                          <span className="text-blue-500">
                            : {item?.vat?.vatPercent}%
                          </span>
                        )}
                      </div>
                    </div>
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
                <span className="">{formatPrice(subtotal)} PHP</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee</span>
                <span className="">{shippingFee} PHP</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Shipping Fee :</span>
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

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)} PHP</span>
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
