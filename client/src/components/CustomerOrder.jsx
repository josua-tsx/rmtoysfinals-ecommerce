import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import toast from "react-hot-toast";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function CustomerOrder() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const queryClient = useQueryClient()

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

  const {mutate: cancelOrderMutation} = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(`/order/user/cancel-order`, orderId)
      return res.data
    } , 
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['order']})
      toast.success("Order Cancelled!")
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!")
    }
  })

  const handleCancelOrder = (orderId) => {
    cancelOrderMutation({orderId})
  }

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };


  if (isError) return <p>error</p>;

  return (
    <div>

      {
        openModal && singleUserOrder && (
          <SingleOrderList order={singleUserOrder} onClose={() => setOpenModal(false)}/>
        )
      }



      <h1 className="text-xl">Your Order</h1>
      <div className=" my-5 p-2 flex h-full flex-col gap-2">
        {/* CARD GOES HERE */}

        
        {
          isPending ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner/>
            </div>
          ) : (
            userOrder && userOrder.length > 0 ? (
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
                      >Cancel</button>
                      <button onClick={() => handleOpenSingleOrder(order)}>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span>no order</span>
            )
          )
        }

      </div>
    </div>
  );
}
