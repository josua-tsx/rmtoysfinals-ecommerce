import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";
import Pagination from "../reusable/Pagination";

export default function UserFailedOrder() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: failedData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userFailed", page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-userFailed`, {
        params: { page, limit: 5 },
      });
      return res.data;
    },
  });

  const userFailed = failedData?.orders || [];
  const totalPages = failedData?.totalPages || 0;
  const totalItems = failedData?.total || 0;

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  if (isError) return <p>Shown error here...</p>;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* MODAL */}
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      {isPending ? (
        <div className="w-full flex justify-center items-center h-[300px]">
          <LoadingSpinner />
        </div>
      ) : userFailed && userFailed.length > 0 ? (
        <div className="grid gap-4">
          {userFailed.map((order) => (
            <div
              key={order._id}
              className="bg-white border-2 border-black rounded-[5px] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all grayscale"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Product Info */}
                <div className="flex gap-4 items-center flex-1">
                  <div className="w-20 h-20 bg-gray-200 border border-black rounded-[5px] flex items-center justify-center p-2 shrink-0">
                    <img
                      src={order?.imageUrl || "/placeholder.png"}
                      alt="Product"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg">
                        {order?.orderItems?.length} ITEM
                        {order?.orderItems?.length > 1 ? "S" : ""}
                      </span>
                      <span className="bg-gray-200 text-gray-700 border border-gray-600 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full">
                        Failed
                      </span>
                      <span className="bg-red-100 text-red-700 border border-red-600 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full">
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">
                      ORDER ID: {order._id}
                    </p>
                    <p className="text-xs text-black font-bold">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-auto">
                  <button
                    onClick={() => handleOpenSingleOrder(order)}
                    className="w-full md:w-auto px-6 py-2 bg-white text-black border border-black rounded-[5px] font-bold text-xs uppercase hover:bg-black hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-300 rounded-[5px] bg-gray-50 text-gray-400">
          <p className="font-bold text-lg">No failed orders</p>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
