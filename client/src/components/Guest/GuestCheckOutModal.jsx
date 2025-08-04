import { useEffect, useMemo, useState } from "react";
import { getGuestCart } from "../../lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import formatPrice from "../../reusable/formatPrice";
import useOrderStore from "../../stores/useOrderStore";
import { useUserStore } from "../../stores/useUserStore";
import axiosInstance from "../../lib/axios";

export default function GuestCheckOutModal({ onClose }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [notes, setNotes] = useState("");
  const [taxes, setTaxes] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(35);
  const [cartItems, setCartItems] = useState({});
  const [useCredits, setUseCredits] = useState("no");

  const [cart, setCart] = useState(getGuestCart());

  console.log(currentOrder);

  //   console.log(cartItems)

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

    const totalPrice = subtotal - totalDiscount;

    return { totalDiscount, subtotal, totalPoints, totalPrice };
  }, [cart]);

  useEffect(() => {
    if (cart) {
      setCartItems(cart.items);
    }
  }, [cart]);

  //   const { mutate: placeOrder } = useMutation({
  //     mutationFn: async (data) => {
  //       const res = await axiosInstance.post(`/order/place-order`, data);

  //       return res.data;
  //     },
  //     onSuccess: () => {
  //       setNotes("");
  //       onClose();
  //       queryClient.invalidateQueries({ queryKey: ["order"] });
  //       queryClient.invalidateQueries({ queryKey: ["cart"] });
  //       toast.success(`Order placed!`);
  //       toast.success(
  //         `Track your order status in your order status page in your profile!`
  //       );
  //     },
  //     onError: (err) => {
  //       toast.error(err.response.data.message || "something went wrong!");
  //     },
  //   });

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
    if (orderData.orderItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    console.log(orderData);

    // // Validate all items before proceeding
    // for (const item of orderData.orderItems) {
    //   if (item.quantity > 5) {
    //     toast.error("You can only order up to 5 items per product at a time.");
    //     return;
    //   }
    // }

    // Proceed if no lock or lock expired
    localStorage.setItem("manual-order-backup", JSON.stringify(orderData));
    setCurrentOrder(orderData);
    navigate("/guestQRpage");
  };

  const handleOrderFormSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { fullName, phoneNumber, paymentMethod, notes, currentAddress } =
      inputs;

    if (!fullName || !phoneNumber || !currentAddress)
      return toast.error("Please input required fields!");

    const orderData = {
      orderItems: cartItems.map((item) => ({
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
      },
      paymentMethod,
      taxPrice: taxes,
      shippingPrice: shippingFee,
      discount: totalDiscount,
      subtotal,
      totalPrice: totalPrice,
      notes,
      quantity: cartItems?.quantity,
      totalPoints,
    };

    // if (paymentMethod === "Cod") {
    //   placeOrder(orderData);
    // }

    if (paymentMethod === "GcashQR" && cartItems.length > 0) {
      handleGcashQRpaymentMethod(orderData);
    }

    if (paymentMethod === "Online Payment") {
      const stripeOrderData = {
        orderItems: cartItems.map((item) => ({
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
        paymentMethod,
        taxPrice: taxes,
        shippingPrice: shippingFee,
        discount: totalDiscount,
        subtotal,
        totalPrice: totalPrice.toString(),
        notes,
        totalPoints,
      };

      placeStripeOrder(stripeOrderData);
    }
  };

  //   if (isActivePending || isCartPending) return <div className="absolute inset-0 backdrop-blur-sm  z-10"><LoadingSpinner fullScreen/></div>;
  //   if (isActiveError || isCartError) return <p>error...</p>;

  return (
    <section className="fixed inset-0 overflow-y-auto flex items-center justify-center font-main z-50 backdrop-blur-sm p-4">
      <div className="bg-card border flex-col-reverse text-sm md:text-normal border-black rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex  md:flex-row">
        {/* Left Panel - Order Form */}

        <div className="w-full md:w-7/12 p-6  overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl">Order Summary</h2>

            <button
              onClick={onClose}
              className="border  border-black  text-card bg-red-700 rounded-[5px] px-5 right-0 -top-8"
            >
              <IoIosClose size={25} />
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
                      className="p-2 rounded-[5px] border border-gray-300"
                      // disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm  text-black mb-1">
                    Phone Number
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      name="phoneNumber"
                      className={`p-2 border border-gray-300 rounded-[5px]`}

                      // disabled
                    />
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
                    className="p-2 border border-gray-300 rounded-[5px]"
                    // disabled
                  />
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
                <option value="GcashQR">GCash QR</option>
                <option value="Online Payment">Credit/Debit Card (TEST)</option>
              </select>
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
            <div className="flex flex-row-reverse w-full  gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-black bg-red-700 text-white rounded-md "
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 flex-1 border border-black bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Order Summary */}
        <div className="w-full md:w-5/12 bg-gray-50 border border-none md:border-l-black  p-6 overflow-y-auto">
          <h3 className=" text-lg mb-4">Your Order</h3>

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
                    <h4 className=" text-gray-800">{item.productName}</h4>
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

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className=" text-green-600">
                  -{formatPrice(totalDiscount)} PHP
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Points Earned</span>
                <span className=" text-blue-600">+{totalPoints}</span>
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
