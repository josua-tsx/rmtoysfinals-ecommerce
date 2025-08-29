import React from "react";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmModal } from "../reusable/ConfirmModal";
import { MdLocalShipping } from "react-icons/md";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function CustomerOrderStatus() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);

  const queryClient = useQueryClient();

  const {
    data: userOrder = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-userOrder`);
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

      {/* CARD GOES HERE */}

      <div className="flex flex-col h-full max-h-[320px]  overflow-y-auto gap-2">
        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : userOrder && userOrder.length > 0 ? (
          userOrder.map((order) => (
            <div
              key={order._id}
              className="flex flex-col md:flex-row gap-2 w-full"
            >
              <div className="flex flex-1  gap-2 items-center border w-full p-1 rounded-[5px] border-black">
                {/* Display the image */}
                <img
                  src={order.imageUrl} // Handle missing image
                  alt="box image"
                  className="w-10"
                />
                <div className="flex w-full  gap-2  justify-between text-sm">
                  <div className="flex flex-col ">
                    <div className="flex gap-2">
                      <p>ID: </p>
                      <span className="text-blue-600">{order._id}</span>
                    </div>
                    <div className="flex gap-2">
                      <p>Status: </p>
                      <span className="text-blue-600">{order.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* ACTIONS */}

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleCancelOrder(order._id)}
                  type="button"
                  className="px-2 py-1 flex-1 text-sm rounded-lg border border-black bg-red-500 text-white "
                >
                  Cancel
                </button>
                <button
                  className="px-2 flex-1  py-1 text-sm rounded-lg border border-black text-white  bg-blue-500 "
                  onClick={() => handleOpenSingleOrder(order)}
                >
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <span>no order</span>
        )}
      </div>
    </>
  );
}
