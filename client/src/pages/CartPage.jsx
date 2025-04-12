import Buttons from "../reusable/Buttons";
import CartCard from "../components/CartCard";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useState } from "react";
import OrderSummaryModal from "../components/OrderSummaryModal";
import formatPrice from "../reusable/formatPrice";

export default function CartPage() {
  const [openOrderModal, setOrderModal] = useState(false);

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
    return total + item.productId.points * item.quantity
  }, 0);


  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error loading cart.</div>;

  return (
    <section className="pt-[130px] font-main p-3">
      {openOrderModal && (
        <OrderSummaryModal onClose={() => setOrderModal(false)} />
      )}

      <div className="max-w-[1280px] bg-yellow h-screen mx-auto">
        <div className="flex w-full  mb-5 ">
          <h1 className="text-4xl">CART</h1>
        </div>

        <form className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-col gap-3  flex-1 uppercase">
            {/* PRODUCTS GOES HERE */}

            {cart?.items?.length > 0 ? (
              cart?.items.map((item) => (
                <CartCard key={item?._id} productCart={item} />
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>

          <div className="border md:w-[270px] gap-2 flex flex-col bg-card rounded-[5px] p-3 border-black">
            <h1 className="uppercase text-xl mb-3">order summary</h1>
            <div className="flex flex-1 flex-col gap-1">
              <p>
                TOTAL ITEMS: <span>{cart?.items?.length}</span>
              </p>
              <p>
                TOTAL POINTS: <span>+{totalPoints}</span>
              </p>
              <p>
                TOTAL PRICE:{" "}
                <span className="text-indigo-500">
                  {" "}
                  {cart?.items ? formatPrice(totalPrice) : 0} PHP
                </span>
              </p>
            </div>
            <div onClick={() => setOrderModal(true)}>
              <Buttons buttonName={"checkout"} />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
