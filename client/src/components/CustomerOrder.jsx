import { MdLocalShipping } from "react-icons/md";
import CustomerOrderStatus from "./CustomerOrderStatus";
import { useState } from "react";
import CustomerDeliveredStatus from "./CustomerDeliveredStatus";

export default function CustomerOrder({ toggle, openCustomer }) {
  const [orderStatus, setOrderStatus] = useState("pending");

  const handleOrderChange = (e) => {
    const newStatus = e.target.value;
    setOrderStatus(newStatus);
  };

  return (
    <div className="relative  flex">
      <button onClick={toggle}>
        <MdLocalShipping size={28} />
      </button>

      {openCustomer && (
        <div className="border border-black text-sm md:w-[550px] w-[90%] fixed top-20 right-0 left-0 mx-auto  bg-card rounded-[5px] p-4 md:absolute md:right-0 md:left-auto  md:top-10 ">
          <div className="flex items-center mb-2 justify-center gap-2">
            <h1 className="text-lg">Your Order Status</h1>
            <MdLocalShipping size={28} />
          </div>

          <div className="bg-yellow-50 border-l-4 border-red-700 text-red-700 p-2 mb-2">
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

          <select
            name=""
            id=""
            value={orderStatus}
            onChange={(e) => handleOrderChange(e)}
            className="border border-black outline-none p-1 px-4 rounded-[5px]  my-2"
          >
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
          </select>

          {orderStatus === "pending" ? (
            <CustomerOrderStatus />
          ) : (
            <CustomerDeliveredStatus />
          )}
        </div>
      )}
    </div>
  );
}
