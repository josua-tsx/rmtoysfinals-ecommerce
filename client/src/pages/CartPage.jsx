import Buttons from "../reusable/Buttons";
import CartCard from "../components/CartCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useEffect, useState } from "react";
import OrderSummaryModal from "../components/OrderSummaryModal";
import formatPrice from "../reusable/formatPrice";
import CreditPointsAuto from "../components/CreditPointsAuto";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import useOrderStore from "../stores/useOrderStore";

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
   }, [currentOrder]);

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

  const totalPrice = cart?.items?.reduce((total, item) => {
    return total + item.productId.price * item.quantity;
  }, 0);

  const totalPoints = cart?.items?.reduce((total, item) => {
    return total + item.productId.points * item.quantity;
  }, 0);

  if (isPending) return <div>Loading...</div>;
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

        <form className="flex flex-col md:flex-row pb-10 bg-yellow gap-4">
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
              <div className="flex flex-1 flex-col gap-2">
                <p>
                  Total Items: <span>{cart?.items?.length}</span>
                </p>
                <p>
                  Total Points: <span>+{totalPoints}</span>
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
