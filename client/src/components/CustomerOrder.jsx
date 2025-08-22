import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import toast from "react-hot-toast";
import LoadingSpinner from "../reusable/LoadingSpinner";
import { ConfirmModal } from "../reusable/ConfirmModal";
import { MdLocalShipping } from "react-icons/md";

export default function CustomerOrder({ toggle, openCustomer }) {
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
    <div className="relative  flex">
      <button onClick={toggle}>
        <MdLocalShipping size={28} />
      </button>

      {openCustomer && (
        <div className="border border-black text-sm md:w-[550px] w-[90%] fixed top-20 right-0 left-0 mx-auto  bg-card rounded-[5px] p-4 md:absolute md:right-0 md:left-auto  md:top-10 ">
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

          <div className="flex items-center mb-2 justify-center gap-2">
            <h1 className="text-lg">Your Order Status</h1>
            <MdLocalShipping size={28} />
          </div>

          <div className="bg-yellow-50 border-l-4 border-red-700 text-red-700 p-4 mb-2">
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
                <p className="text-sm ">
                  <strong>Important:</strong> Once your order status changes to
                  Shipped, or Out for Delivery, it can no longer be cancelled.
                  Only orders with a Pending and Processing status are eligible
                  for cancellation. Thank you for understanding!
                </p>
              </div>
            </div>
          </div>

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
                      className="px-2 flex-1  py-1 text-sm rounded-lg border border-black text-white  bg-primary "
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
        </div>
      )}
    </div>
  );
}
