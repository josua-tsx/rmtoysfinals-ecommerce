import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmModal } from "../reusable/ConfirmModal";

import LoadingSpinner from "../reusable/LoadingSpinner";
import Pagination from "../reusable/Pagination";

export default function CustomerOrderStatus() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: orderData, isPending } = useQuery({
    queryKey: ["order", page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-userOrder`, {
        params: { page, limit: 5 },
      });
      return res.data;
    },
  });

  const userOrder = orderData?.orders || [];
  const totalPages = orderData?.totalPages || 0;
  const totalItems = orderData?.total || 0;

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });
  const { mutate: cancelOrderMutation } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(`/order/user/cancel-order`, {
        orderId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Order Cancelled!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleCancelOrder = (orderId) => {
    setIsCancelModalOpen(true);
    setCancelOrderId(orderId);
  };

  const handleCloseCancelOrder = () => {
    setIsCancelModalOpen(false);
    setCancelOrderId(null);
  };

  const handleConfirmCancelOrder = () => {
    if (cancelOrderId) {
      cancelOrderMutation(cancelOrderId);
      handleCloseCancelOrder();
    }
  };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  return (
    <>
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title={"Confirm Cancel Order"}
        message={
          "Are you sure you want to cancel this order? This action cannot be undone. "
        }
        onCancel={handleCloseCancelOrder}
        onConfirm={handleConfirmCancelOrder}
      />

      {/* {openRefundModal && singleUserOrder && (
        <RefundModal
          order={singleUserOrder}
          onClose={() => {
            setOpenRefundModal(false);
            setOpenModal(false);
          }}
        />
      )}

      {/* CARD GOES HERE */}

      <div className="flex flex-col h-full max-h-[350px] overflow-y-auto gap-4 p-1">
        {isPending ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner />
          </div>
        ) : userOrder && userOrder.length > 0 ? (
          userOrder.map((order) => (
            <div
              key={order._id}
              className="flex flex-col gap-3 w-full bg-white border border-black p-4 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex gap-4 items-center">
                {/* Display the image */}
                <div className="bg-gray-100 p-2 border border-black rounded-[5px] shrink-0">
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
                    <span className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 px-2 py-0.5 rounded  font-black uppercase text-[10px] tracking-wider">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 pt-2 border-t border-black/5">
                {(order.status === "Pending" ||
                  order.status === "Processing") && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    type="button"
                    className="flex-1 py-2  font-black uppercase text-[10px] tracking-widest rounded-[5px] border border-black bg-white text-red-600 shadow-[3px_3px_0px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  className="flex-1 py-2  font-black uppercase text-[10px] tracking-widest rounded-[5px] border border-black bg-[#22c55e] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
                  onClick={() => handleOpenSingleOrder(order)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 border border-dashed border-black/10 rounded-[5px]">
            <p className=" font-black uppercase text-gray-400 tracking-widest">
              No active orders
            </p>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      )}
    </>
  );
}
