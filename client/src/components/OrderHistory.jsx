import { useState } from "react";
import UserDeliveredOrder from "./UserDeliveredOrder";
import UserCancelledOrder from "./UserCancelledOrder";
import UserRefundedOrder from "./UserRefundedORder";
import UserFailedOrder from "./UserFailedOrder";

export default function OrderHistory() {
 
  const [selectedComponent, setSelectedComponent] = useState("Delivered")

  const handleChangeComponent = (e) => {
    const componentChange = e.target.value 
    setSelectedComponent(componentChange)
  }

  return (
    <div>
      <div className="flex gap-5 items-center">
      <h1 className="text-xl">ORDER HISTORY</h1>
      <div>
        <select onChange={handleChangeComponent}
         className="outline-none border border-black rounded-[5px] px-5 p-1">
          <option value="Delivered">DELIVERED</option>
          <option value="Cancelled">CANCELLED</option>
          <option value="Refunded">REFUNDED</option>
          <option value="Failed">FAILED</option>
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
