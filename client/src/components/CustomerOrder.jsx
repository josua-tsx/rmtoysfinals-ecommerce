import { MdLocalShipping } from "react-icons/md";
import CustomerOrderStatus from "./CustomerOrderStatus";
import { useState } from "react";
import CustomerDeliveredStatus from "./CustomerDeliveredStatus";
import PropTypes from "prop-types";

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
        <div className="border border-black text-sm md:w-[550px] w-[95%] fixed top-24 right-0 left-0 mx-auto bg-card rounded-[5px] p-6 md:absolute md:right-0 md:left-auto md:top-12  z-[100] font-main overflow-y-auto max-h-[90vh]">
          <div className="flex items-center mb-6 justify-center gap-3">
            <h1 className=" font-black uppercase tracking-widest text-xl">
              Order Status
            </h1>
            <MdLocalShipping size={32} className="text-black" />
          </div>

          {/* Retro Note Sticker */}
          <div className="bg-[#ef4444] text-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform rotate-1 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-white p-1 rounded-sm border border-black rotate-[-10deg] shrink-0 mt-1">
                <svg
                  className="h-5 w-5 text-red-600"
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
              <p className=" font-black uppercase text-[11px] leading-tight tracking-wide">
                <span className="bg-white text-red-600 px-1 mr-1">
                  Important:
                </span>
                Once status is Shipped/Delivering, it cannot be cancelled. Only
                Pending/Processing are eligible.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <label className=" font-black uppercase text-[10px] text-gray-400 tracking-widest pl-1">
              Filter View
            </label>
            <select
              name=""
              id=""
              value={orderStatus}
              onChange={(e) => handleOrderChange(e)}
              className="border border-black outline-none p-3 px-4 rounded-[5px] bg-white  font-black uppercase text-xs tracking-wider cursor-pointer hover:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              <option value="pending">Pending Orders</option>
              <option value="delivered">Delivered History</option>
            </select>
          </div>

          <div className="mt-4">
            {orderStatus === "pending" ? (
              <CustomerOrderStatus />
            ) : (
              <CustomerDeliveredStatus />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

CustomerOrder.propTypes = {
  toggle: PropTypes.func.isRequired,
  openCustomer: PropTypes.bool.isRequired,
};
