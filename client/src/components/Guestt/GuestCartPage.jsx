import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useOrderStore from "../../stores/useOrderStore";
import { getGuestCart } from "../../lib/utils";
import CreditPointsAuto from "../CreditPointsAuto";
import { FaShoppingCart, FaArrowRight, FaSearch } from "react-icons/fa";
import formatPrice from "../../reusable/formatPrice";
import Buttons from "../../reusable/Buttons";
import GuestCard from "./GuestCard";
import Pagination from "../../reusable/Pagination";

import GuestSummaryModal from "./GuestSummaryModal";

export default function GuestCartPage() {
  const [openOrderModal, setOrderModal] = useState(false);
  const [cart, setCart] = useState(getGuestCart());
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  // IF CUSTOMER USED BACK BUTTON (NOT THE CANCEL) IT WILL CLEAR THE ORDER IN THE LOCAL STORAGE
  const currentOrder = useOrderStore((state) => state.currentOrder);
  const clearOrder = useOrderStore((state) => state.clearOrder);
  useEffect(() => {
    if (currentOrder) {
      clearOrder();
    }
  }, [currentOrder, clearOrder]);

  const totalPrice = cart?.items?.reduce((total, item) => {
    if (item.isSelected) {
      return total + item.price * item.quantity;
    }
    return total;
  }, 0);

  const updateCart = () => {
    setCart(getGuestCart());
  };

  const totalItems = cart?.items?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems =
    cart?.items?.slice((page - 1) * itemsPerPage, page * itemsPerPage) || [];

  return (
    <section className="pt-[130px] min-h-screen bg-yellow text-sm md:text-normal font-main p-4 md:p-8">
      {openOrderModal && (
        <GuestSummaryModal onClose={() => setOrderModal(false)} />
      )}

      <div className="max-w-[1280px] mx-auto">
        <div className="flex w-full flex-col mb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            Guest Cart
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            {totalItems > 0
              ? `You have ${totalItems} ${totalItems === 1 ? "item" : "items"} ready for checkout`
              : "Your cart is currently empty"}
          </p>
        </div>

        <CreditPointsAuto />

        <div className="flex flex-col lg:flex-row gap-8 pb-10 w-full relative">
          {/* Cart Items List */}
          <div className="flex-1 flex flex-col gap-4">
            {paginatedItems.length > 0 ? (
              <>
                <div className="flex flex-col gap-4 min-h-[150px]">
                  {paginatedItems.map((item) => (
                    <GuestCard
                      key={item._id}
                      refreshCart={updateCart}
                      productCart={item}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 0 && (
                  <div className="mt-6 flex justify-center bg-yellow pb-4 pt-2 z-10">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      onPageChange={setPage}
                      isLoading={false}
                      currentItemsCount={paginatedItems.length}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-[5px] p-12 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-6">
                <div className="bg-gray-100 p-6 rounded-full border-2 border-black">
                  <FaShoppingCart className="text-5xl text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-black">
                    Your Cart is Empty
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Looks like you haven't added anything yet. Explore our shop
                    to find the best toys!
                  </p>
                </div>
                <Buttons
                  buttonName="Start Shopping"
                  onClick={() => navigate("/shop")}
                  icon={<FaSearch size={18} />}
                  animateIcon={true}
                  className="px-8 py-3 text-lg"
                />
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {cart?.items?.length > 0 && (
            <div className="lg:w-[380px] flex-shrink-0">
              <div className="bg-white border-2 border-black rounded-[5px] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-[140px]">
                <h2 className="text-2xl font-black uppercase tracking-widest border-b-2 border-black pb-4 mb-6">
                  Order Summary
                </h2>

                {/* Limit Warning */}
                <div className="bg-red-50 border-2 border-red-200 rounded-[5px] p-4 text-red-700 mb-6 flex gap-3 items-start">
                  <svg
                    className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs font-bold leading-tight">
                    <span className="uppercase font-black block mb-1">
                      Purchase Limit
                    </span>
                    Max 5 items per product per order.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-gray-600 font-bold">
                    <span>Total Items</span>
                    <span>{cart?.items?.length}</span>
                  </div>

                  <div className="border-t-2 border-dashed border-gray-300 my-4" />

                  <div className="flex justify-between items-end">
                    <span className="text-lg font-black uppercase tracking-tight">
                      Subtotal
                    </span>
                    <div className="text-right">
                      <span className="text-3xl font-black block leading-none text-indigo-600 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.1)]">
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
                  className="w-full py-4 text-base font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
