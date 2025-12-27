import axiosInstance from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import LoadingSpinner from "../reusable/LoadingSpinner";
import SingleOrderList from "./SingleOrderList";
import { Link } from "react-router-dom";

export default function CustomerDeliveredStatus() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const {
    data: userDelivered = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userDelivered"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-userFiveDelivered`);
      return res.data;
    },
  });
  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  console.log(singleUserOrder);

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  if (isError) return <p>Error</p>;

  return (
    <>
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      {/* CARD GOES HERE */}

      <div className="flex flex-col h-full max-h-[350px] overflow-y-auto gap-4 p-1">
        {isPending ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : userDelivered && userDelivered.length > 0 ? (
          userDelivered.map((order) => (
            <div
              key={order._id}
              className="flex flex-col gap-3 w-full bg-white border border-black p-4 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(34,197,94,1)]"
            >
              <div className="flex gap-4 items-center">
                <div className="bg-green-50 p-2 border border-black rounded-[5px] shrink-0">
                  <img
                    src={order.imageUrl}
                    alt="box image"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className=" font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Order ID
                    </span>
                    <span className=" font-black text-xs text-blue-700 truncate">
                      #{order._id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className=" font-black text-[10px] text-gray-400 uppercase tracking-widest">
                      Status
                    </span>
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded  font-black uppercase text-[10px] tracking-wider">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 pt-2 border-t border-black/5">
                <button
                  className="flex-1 py-2  font-black uppercase text-[10px] tracking-widest rounded-[5px] border border-black bg-white text-blue-600 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
                  onClick={() => handleOpenSingleOrder(order)}
                >
                  View Order
                </button>

                <button
                  onClick={() => handleOpenSingleOrder(order)}
                  className="flex-1 py-2  font-black uppercase text-[10px] tracking-widest rounded-[5px] border border-black bg-[#22c55e] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
                >
                  Rate Product
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-black/10 rounded-[5px]">
            <p className=" font-black uppercase text-gray-400 tracking-widest">
              No order history
            </p>
          </div>
        )}

        {userDelivered && userDelivered.length > 0 && (
          <Link
            to={"/profile"}
            className=" font-black uppercase text-[10px] tracking-[0.2em] text-center mt-4 text-gray-400 hover:text-black transition-colors"
          >
            --- View Full History In Profile ---
          </Link>
        )}
      </div>
    </>
  );
}
