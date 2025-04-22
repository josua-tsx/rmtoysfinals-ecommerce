import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import toast from "react-hot-toast";
import LoadingSpinner from "../reusable/LoadingSpinner";
import { ConfirmModal } from "../reusable/ConfirmModal";

export default function CustomerOrder() {
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

  if (isError) return <p>error</p>;

  return (
    <div>
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

      <h1 className="text-xl">Your Order</h1>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-2">
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
            <div className="ml-3 flex flex-col gap-2">
              <p className="text-md text-black">
                <strong>Important:</strong> Once your order status changes to Shipped, or Out for Delivery, it can no longer be cancelled. Only orders with a Pending and Processing status are eligible for cancellation. Thank you for understanding!
              </p>
            </div>
          </div>
        </div>

      <div className=" my-5 p-2 flex h-full flex-col gap-2">
        {/* CARD GOES HERE */}

        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : userOrder && userOrder.length > 0 ? (
          userOrder.map((order) => (
            <div
              key={order._id}
              className="border flex p-2 gap-5 items-center border-black rounded-[5px]"
            >
              {/* Display the image */}
              <img
                src={order.imageUrl} // Handle missing image
                alt="box image"
                className="w-16"
              />
              <div className="flex w-full gap-10 md:gap-0 overflow-x-auto justify-between text-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <p>Order Id: </p>
                    <span className="text-blue-600">{order._id}</span>
                  </div>
                  <div className="flex gap-2">
                    <p>Status: </p>
                    <span className="text-blue-600">{order.status}</span>
                  </div>
                  <div className="flex gap-2">
                    <p>Total Items: </p>
                    <span className="text-blue-600">
                      {order.orderItems?.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <p>Date Ordered:</p>
                    <span className="text-blue-600">{order.createdAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <p>Estimated Delivery Date:</p>
                    <span className="text-blue-600">2 - 6 days</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button onClick={() => handleOpenSingleOrder(order)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <span>no order</span>
        )}
      </div>
    </div>
  );
}
