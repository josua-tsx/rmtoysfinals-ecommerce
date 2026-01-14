import { useState } from "react";
import UserDeliveredOrder from "./UserDeliveredOrder.jsx";
import UserCancelledOrder from "./UserCancelledOrder.jsx";
import UserRefundedOrder from "./UserRefundedOrder.jsx";
import UserFailedOrder from "./UserFailedOrder.jsx";

export default function OrderHistory() {
  const [selectedComponent, setSelectedComponent] = useState("Delivered");

  const tabs = [
    { id: "Delivered", label: "Delivered", icon: "📦" },
    { id: "Cancelled", label: "Cancelled", icon: "🚫" },
    { id: "Refunded", label: "Refunded", icon: "💸" },
    { id: "Failed", label: "Failed", icon: "⚠️" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest">
          Order History
        </h1>

        <div className="flex bg-white border border-black rounded-[5px] p-1 gap-1 overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedComponent(tab.id)}
              className={`px-4 py-2 rounded-[3px] text-xs font-bold uppercase transition-all whitespace-nowrap ${
                selectedComponent === tab.id
                  ? "bg-black text-white shadow-md"
                  : "bg-transparent text-gray-500 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-black rounded-[5px] p-4 min-h-[500px]">
        {selectedComponent === "Delivered" && <UserDeliveredOrder />}
        {selectedComponent === "Cancelled" && <UserCancelledOrder />}
        {selectedComponent === "Refunded" && <UserRefundedOrder />}
        {selectedComponent === "Failed" && <UserFailedOrder />}
      </div>
    </div>
  );
}
