import { useState } from "react";
import axiosInstance from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
import SingleOrderList from "./SingleOrderList";

export default function UserRefundedOrder() {

  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const {
    data: userRefunded = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userRefunded"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-userRefunded`);
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
    <div className=" my-5 p-2 flex flex-col gap-2">
    {/* CARD GOES HERE */}

    {openModal && singleUserOrder && (
      <SingleOrderList
        order={singleUserOrder}
        onClose={() => setOpenModal(false)}
      />
    )}

    <div className=" my-5 p-2 flex flex-col gap-2">
      {/* CARD GOES HERE */}

      {userRefunded && userRefunded.length > 0 ? (
        userRefunded.map((order) => (
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
                  <span className="text-red-700">{order.status}</span>
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
        <span>no Refunded order.</span>
      )}
    </div>
  </div>
  )
}
