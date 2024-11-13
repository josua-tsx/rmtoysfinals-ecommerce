import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";

export default function OrderHistory() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const {
    data: deliveredCancelled = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["deliveredCancelled"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-deliveredCancelled`);
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

  if (isPending) return <p>loading...</p>;
  if (isError) return <p>error</p>;

  return (
    <div>

      {
        openModal && singleUserOrder && (
          <SingleOrderList order={singleUserOrder} onClose={() => setOpenModal(false)}/>
        )
      }



      <h1 className="text-xl">ORDER HISTORY</h1>
      <div className=" my-5 p-2 flex flex-col gap-2">
        {/* CARD GOES HERE */}

        {deliveredCancelled && deliveredCancelled.length > 0 ? (
          deliveredCancelled.map((order) => (
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
                  {/* <button>Cancel</button> */}
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
