import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../../stores/useOrderStore";
import { getGuestCart } from "../../lib/utils";
import CreditPointsAuto from "../CreditPointsAuto";
import { FaShoppingCart } from "react-icons/fa";
import formatPrice from "../../reusable/formatPrice";
import Buttons from "../../reusable/Buttons";
import GuestCard from "./GuestCard";

import GuestSummaryModal from "./GuestSummaryModal";

export default function GuestCartPage() {
  const [openOrderModal, setOrderModal] = useState(false);
  const [cart, setCart] = useState(getGuestCart());

  const navigate = useNavigate();

  // IF CUSTOMER USED BACK BUTTON (NOT THE CANCEL) IT WILL CLEAR THE ORDER IN THE LOCAL STORAGE
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const clearOrder = useOrderStore((state) => state.clearOrder);
  useEffect(() => {
    if (currentOrder) {
      clearOrder();
    }
  }, [currentOrder]);

  const totalPrice = cart?.items?.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const updateCart = () => {
    setCart(getGuestCart());
  };

  return (
    <section className="pt-[130px] bg-yellow  text-sm md:text-normal font-main p-3">
      {openOrderModal && (
        <GuestSummaryModal onClose={() => setOrderModal(false)} />
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
                <GuestCard
                  key={item._id}
                  refreshCart={updateCart}
                  productCart={item}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-black">
                <FaShoppingCart className="mx-auto text-4xl text-black mb-4" />
                <h3 className="text-xl font-medium text-black mb-2">
                  Your Cart is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  {" "}
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

          {cart?.items?.length > 0 && (
            <div className="border md:w-[270px] gap-2 flex flex-col bg-card rounded-[5px] p-6 border-black">
              <h1 className=" text-xl mb-3">Order Summary</h1>
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
                      You can only order 5 items per product at a time.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <p>
                  Total Items: <span>{cart?.items?.length}</span>
                </p>

                <p>
                  Total Price:{" "}
                  <span className="text-indigo-500">
                    {" "}
                    {cart?.items ? formatPrice(totalPrice) : 0} PHP
                  </span>
                </p>
              </div>
              <div onClick={() => setOrderModal(true)}>
                <Buttons buttonName={"Checkout"} />
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
