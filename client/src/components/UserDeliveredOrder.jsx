import { useState } from "react";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";

export default function UserDeliveredOrder() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const {
    data: userDelivered = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userDelivered"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-userDelivered`);
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

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  if (isError) return <p>error</p>;

  return (
    <div className=" my-5 p-2 flex flex-col h-[600px] overflow-y-auto gap-2">
      {/* CARD GOES HERE */}

      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <div className=" my-5 p-2 flex flex-col h-full gap-2">
        {/* CARD GOES HERE */}

        {isPending ? (
          <div className="w-full flex justify-center items-center  h-full">
            <LoadingSpinner />
          </div>
        ) : userDelivered && userDelivered.length > 0 ? (
          userDelivered.map((order) => (
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
                    <span className="text-blue-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <p>Estimated Delivery Date:</p>
                    <span className="text-blue-600">1 - 3 days</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-row md:flex-col gap-2">
                  {/* <button>Cancel</button> */}
                  <button
                    className="flex-1"
                    onClick={() => handleOpenSingleOrder(order)}
                  >
                    View Details
                  </button>

                  {order.status === "Delivered" ? (
                    <button
                      onClick={() => handleOpenSingleOrder(order)}
                      className="flex-1 text-indigo-700"
                    >
                      Write a review
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <span>no delivered order.</span>
        )}
      </div>
    </div>
  );
}
