import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminSuccesfullTransactions from "./AdminSuccesfullTransactions";
import AdminFailedTransactions from "./AdminFailedTransactions";
import AdminRefundedCancelledTransactions from "./AdminRefundedCancelledTransactions";
import AdminCancelledTransact from "./AdminCancelledTransact";

export default function AdminOrderTransact() {
  const [selectedComponent, setSelectedComponent] = useState("successful");

  const handleChangeComponent = (e) => {
    const componentChange = e.target.value;

    setSelectedComponent(componentChange);
  };

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"ORDER TRANSACTIONS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
          {/* CARD */}

          <div>
            <select
              onChange={handleChangeComponent}
              name=""
              id=""
              className="border border-black outline-none p-2 rounded-[5px] bg-card w-[300px]"
            >
              <option value="successful">Succesful Transactions</option>
              <option value="failed">Failed Transactions</option>
              <option value="refunded">Order Refunded</option>
              <option value="cancelled">Order Cancelled</option>
            </select>
          </div>
        </div>

        {selectedComponent === "successful" && <AdminSuccesfullTransactions />}
        {selectedComponent === "failed" && <AdminFailedTransactions />}
        {selectedComponent === "refunded" && (
          <AdminRefundedCancelledTransactions />
        )}
        {selectedComponent === "cancelled" && (
            <AdminCancelledTransact/>
        )}
      </div>
    </section>
  );
}
