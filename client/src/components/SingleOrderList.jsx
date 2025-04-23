import { IoIosClose } from "react-icons/io";
import { useUserStore } from "../stores/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import AdminAddReasonModal from "./admin/AdminAddReasonModal";
import { useState } from "react";
import formatPrice from "../reusable/formatPrice";
import { useNavigate } from "react-router-dom";

export default function SingleOrderList({ order, onClose }) {
  const currentUser = useUserStore((state) => state.currentUser);

  console.log(currentUser)

  const [reasonModal, setReasonModal] = useState(false);

  const queryClient = useQueryClient();

  const navigate = useNavigate()

  const { mutate: updatePaymentStatusMutation } = useMutation({
    mutationFn: async ({ id, paymentStatus }) => {
      const res = await axiosInstance.put(`/order/${id}/paymentStatus`, {
        paymentStatus,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Sucessfully Updated Status!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const handleChangePaymentStatus = (id, e) => {
    const newPaymentStatus = e.target.value;

    updatePaymentStatusMutation({ id, paymentStatus: newPaymentStatus });
  };

  return (
    <section className="inset-0 z-40 font-main fixed overflow-y-auto md:overflow-y-hidden backdrop-blur-sm p-3">
      {reasonModal && (
        <AdminAddReasonModal
          singleOrderData={order}
          onClose={() => setReasonModal(false)}
        />
      )}

      <div className="h-screen relative flex flex-col md:flex-row-reverse justify-center gap-2 md:gap-10 items-center ">
        <div className="border relative p-2 flex flex-col gap-2 border-black w-full md:w-[500px] bg-card rounded-[5px]">
          <button
            onClick={onClose}
            type="button"
            className="absolute border border-black text-card bg-primary rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>

          {/* CARD GOES HERE */}

          <div className="flex justify-between">
            <div className="flex flex-col text-sm">
              <div className="flex gap-2">
                <p>Total Items: </p>
                <span className="text-indigo-700">
                  {order?.orderItems?.length}
                </span>
              </div>
            
              <div className="flex gap-2">
                <p>Total Points: </p>
                <span className="text-indigo-700">
                  +{order?.totalPoints}
                </span>
              </div>
              <div className="flex gap-2">
                <p>Used Credit Points: </p>
                <span className="text-indigo-700">
                  {order?.usedCredits ? - order?.usedCredits : 0}
                </span>
              </div>
              {/* <div className="flex gap-2">
                <p>Taxes: </p>
                <span className="text-indigo-700">{formatPrice(order.taxPrice)}</span>
              </div> */}
              <div className="flex gap-2">
                <p>Shipping Price: </p>
                <span className="text-indigo-700">
                  {formatPrice(order.shippingPrice)} PHP
                </span>
              </div>
              <div className="flex gap-2">
                <p>Discount: </p>
                <span className="text-indigo-700">{formatPrice(order.discount)} PHP</span>
              </div>
              <div className="flex gap-2">
                <p>To Ship: </p>
                <span className="text-indigo-700">{order.shippingAddress}</span>
              </div>
              <div className="flex gap-2">
                <p>Payment Method: </p>
                <span className="text-indigo-700">{order.paymentMethod}</span>
              </div>
              <div className="flex gap-2">
                <p>Notes: </p>
                <span className="text-indigo-700">
                  {!order.notes ? "No notes provided" : order.notes}
                </span>
              </div>
              {(order?.paymentStatus === "Failed" ||
                  order?.paymentStatus === "Refunded") && (
                  <div className="flex gap-2 items-center">
                    <p>Reasons: </p>
                    <p className="w-full text-red-700" >
                        {order?.reason}
                    </p>
                  </div>
                )}
            </div>
            <div className="flex flex-col text-sm">
              <div className="flex gap-2">
                <p>Subtotal: </p>
                <span className="text-indigo-700">{formatPrice(order.subtotal)} PHP</span>
              </div>
              <div className="flex gap-2">
                <p>Total Price: </p>
                <span className="text-indigo-700">{formatPrice(order.totalPrice)} PHP</span>
              </div>
              <div className="flex gap-2">
                <p>Status: </p>

                {order.status && order.status === "Cancelled" ? (
                  <span className="text-red-700">{order.status}</span>
                ) : (
                  <span className="text-blue-700">{order.status}</span>
                )}
              </div>
              {order?.paymentMethod === "Gcash" && (
                <div className="flex gap-2">
                  <p>Payment Status: </p>
                  {order.paymentStatus && order.paymentStatus === "Failed" || order.paymentStatus === "Refunded" ? <span className="text-red-700">{order.paymentStatus}</span> : <span className="text-blue-700">{order.paymentStatus}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[156px] md:max-h-[500px] overflow-y-auto">
            {order?.orderItems?.length > 0 &&
              order?.orderItems.map((item) => (
                <div
                  key={item?._id}
                  className="border border-black bg-card rounded-[5px] p-2 flex gap-4 items-center"
                >
                  <img
                    src={item?.productId?.productImages[0]}
                    alt="product image"
                    className="w-12"
                  />
                  <div className="text-sm flex justify-between w-full">
                    <div>
                      <div className="text-sm flex  gap-2">
                        <p>Name: </p>
                        <span>{item?.productId?.productName}</span>
                      </div>
                      <div className="text-sm flex  gap-2">
                        <p>Price: </p>
                        <span>{item?.productId?.price}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <p>Category: </p>
                        <span>{item?.productId?.category?.categoryName}</span>
                      </div>
                      <div className="flex gap-2">
                        <p>Quantity: </p>
                        <span>{item?.quantity}</span>
                      </div>
                      {
                        order?.status === "Delivered" ? (
                          <button onClick={() => navigate(`/product/${item?.productId._id}`)}
                      className="text-indigo-700 underline">Click to write a review</button>
                        ) : ""
                      }
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {order.paymentMethod === "GcashQR" && (
          <div className="border border-black flex flex-col p-2 gap-5 bg-card  rounded-[5px]">
            <div className="flex flex-col gap-5">
              <div className="h-full">
                <img
                  src={order?.gcashQRmethod?.proofOfPaymentImage}
                  alt="receipt imgae"
                  className="h-[250px] md:h-[550px] max-w-[370px] object-cover rounded-[5px]"
                />
              </div>

              <div className="flex text-sm flex-col gap-1">
                <div className="flex flex-col md:flex-row gap-2">
                  <p>Gcash Number: </p>
                  <p>{order?.gcashQRmethod?.gcashName}</p>
                </div>
               
              </div>
            </div>


            {(currentUser.role === "admin" || currentUser.role === "validatorStaff") && (
              <div className="w-full flex gap-2 ">
                <select
                  onChange={(e) => handleChangePaymentStatus(order._id, e)}
                  value={order?.paymentStatus}
                  name="paymentStatus"
                  id="paymentStatus"
                  className="text-center flex-1 border border-black p-1 rounded-[5px] outline-none"
                >
                  <option value="Pending">PENDING</option>
                  <option value="Paid">PAID</option>
                  <option value="Failed">FAILED</option>
                  <option value="Refunded">REFUNDED</option>
                </select>

                {(order?.paymentStatus === "Failed" ||
                  order?.paymentStatus === "Refunded") && (
                  <button
                    onClick={() => setReasonModal(true)}
                    className="bg-red-700 px-2 text-card rounded-[5px]"
                  >
                    Reasons
                  </button>
                )}
              </div>
            )}
            
          </div>
        )}
      </div>
    </section>
  );
}
