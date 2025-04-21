import { useState } from "react";
import UserDeliveredOrder from "./UserDeliveredOrder.jsx";
import UserCancelledOrder from "./UserCancelledOrder.jsx";
import UserRefundedOrder from "./UserRefundedOrder.jsx";
import UserFailedOrder from "./UserFailedOrder.jsx";

export default function OrderHistory() {
 
  const [selectedComponent, setSelectedComponent] = useState("Delivered")

  const handleChangeComponent = (e) => {
    const componentChange = e.target.value 
    setSelectedComponent(componentChange)
  }

  return (
    <div>
      <div className="flex gap-5 items-center">
      <h1 className="text-xl">Order History</h1>
      <div>
        <select onChange={handleChangeComponent}
         className="outline-none border border-black rounded-[5px] px-5 p-1">
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Refunded">Refunded</option>
          <option value="Failed">Failed</option>
        </select>
      </div>
      </div>

      { selectedComponent === "Delivered" && <UserDeliveredOrder/>}
      { selectedComponent === "Cancelled" && <UserCancelledOrder/>}
      { selectedComponent === "Refunded" && <UserRefundedOrder/>}
      { selectedComponent === "Failed" && <UserFailedOrder/>}
      
    </div>
  );
}
