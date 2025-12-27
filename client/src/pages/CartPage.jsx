import Buttons from "../reusable/Buttons";
import CartCard from "../components/CartCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useEffect, useState } from "react";
import OrderSummaryModal from "../components/OrderSummaryModal";
import formatPrice from "../reusable/formatPrice";
import CreditPointsAuto from "../components/CreditPointsAuto";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaArrowRight, FaSearch } from "react-icons/fa";
import useOrderStore from "../stores/useOrderStore";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function CartPage() {
  const [openOrderModal, setOrderModal] = useState(false);

  const navigate = useNavigate();

  // IF CUSTOMER USED BACK BUTTON (NOT THE CANCEL) IT WILL CLEAR THE ORDER IN THE LOCAL STORAGE
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const clearOrder = useOrderStore((state) => state.clearOrder);
  useEffect(() => {
    if (currentOrder) {
      clearOrder();
    }
  }, [currentOrder, clearOrder]);

  const {
    data: cart = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/cart/get`);
      return res.data;
    },
  });

  console.log(cart);

  const totalPrice = cart?.items?.reduce((total, item) => {
    return total + item.productId.price * item.quantity;
  }, 0);

  const totalPoints = cart?.items?.reduce((total, item) => {
    return total + item.productId.points * item.quantity;
  }, 0);

  if (isPending) return <LoadingSpinner fullScreen />;
  if (isError) return <div>Error loading cart.</div>;

  return (
    <section className="pt-[130px] bg-yellow  text-sm md:text-normal font-main p-3">
      {openOrderModal && (
        <OrderSummaryModal onClose={() => setOrderModal(false)} />
      )}

      <div className="max-w-[1280px] bg-yellow h-screen mx-auto">
        <div className="flex  w-full flex-col  mb-5 ">
          <h1 className="text-3xl md:text-4xl">Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart?.items?.length > 1
              ? cart?.items?.length + " items in your cart"
              : cart?.items?.length + " item in your cart"}
          </p>
        </div>

        <CreditPointsAuto />

        <form className="flex flex-col md:flex-row pb-10 w-full bg-yellow gap-4">
          <div className="flex flex-col  gap-3  rounded-[5px]  h-[400px] md:h-[550px]  overflow-y-auto md:flex-1 ">
            {/* PRODUCTS GOES HERE */}

            {cart?.items?.length > 0 ? (
              cart?.items.map((item) => (
                <CartCard key={item?._id} productCart={item} />
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-black">
                <FaShoppingCart className="mx-auto text-4xl text-black mb-4" />
                <h3 className="text-xl font-medium text-black mb-2">
                  Your Cart is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  {" "}
                  Add items to your cart by clicking &quot;Add to Cart&quot; on
                  products. They&apos;ll appear here ready for purchase.
                </p>
                <Buttons
                  buttonName="Browse products"
                  onClick={() => navigate("/shop")}
                  icon={<FaSearch size={18} />}
                  animateIcon={true}
                  className="w-fit mx-auto px-6 py-2"
                />
              </div>
            )}
          </div>

          {cart?.items?.length > 0 && (
            <div className="border md:w-[320px] gap-4 flex flex-col bg-card rounded-lg p-6 border-black ">
              <h1 className="text-2xl font-black uppercase tracking-widest border-b-2 border-black pb-2">
                Order Summary
              </h1>

              <div className="bg-red-50 border border-black rounded-[5px] p-3 text-red-700 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.2)]">
                <div className="flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold leading-tight">
                    <span className="uppercase font-black">Limit:</span> Max 5
                    items per product per order.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 my-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-gray-400">
                    Total Items
                  </span>
                  <span className="font-bold">{cart?.items?.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-blue-600">
                    Points Earned
                  </span>
                  <span className="font-black text-blue-600">
                    +{totalPoints}
                  </span>
                </div>
                <div className="h-px bg-dashed border-b-2 border-dashed border-gray-100 my-1" />
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black uppercase tracking-tighter">
                    Subtotal
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black block leading-none text-indigo-600">
                      {cart?.items ? formatPrice(totalPrice) : "0.00"}
                    </span>
                    <span className="text-[10px] font-black uppercase text-gray-400">
                      Philippine Peso
                    </span>
                  </div>
                </div>
              </div>

              <Buttons
                buttonName="Proceed to Checkout"
                onClick={() => setOrderModal(true)}
                icon={<FaArrowRight size={18} />}
                animateIcon={true}
                className="w-full py-4 text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
