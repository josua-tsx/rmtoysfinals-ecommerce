import {
  FaClipboardList,
  FaBoxOpen,
  FaTruck,
  FaHome,
  FaCheck,
  FaBan,
} from "react-icons/fa";

const OrderTracking = ({ status }) => {
  const steps = [
    {
      label: "Placed",
      icon: FaClipboardList,
      statuses: ["Pending"],
    },
    {
      label: "Processing",
      icon: FaBoxOpen,
      statuses: ["Processing", "To Ship"],
    },
    {
      label: "Shipped",
      icon: FaTruck,
      statuses: ["Shipped", "Out for Delivery"],
    },
    {
      label: "Delivered",
      icon: FaHome,
      statuses: ["Delivered"],
    },
  ];

  // Determine current step index based on status
  // If status is Cancelled/Refunded/Failed, we treat it differently
  const isNegativeStatus = ["Cancelled", "Refunded", "Failed"].includes(status);

  let currentStepIndex = -1;
  if (!isNegativeStatus) {
    currentStepIndex = steps.findIndex((step) =>
      step.statuses.includes(status)
    );

    // If exact match not found (e.g. if we have a status not in the list),
    // we might need fallback logic.
    // But assuming the statuses map covers the flow:
    // If "Delivered", index is 3.
    // If "Pending", index is 0.

    // Fallback: if status suggests a later stage but not in list?
    // For now, let's assume strict mapping or use the last found index.

    // Better logic: mapping specific status strings to index directly
    const statusIdxMap = {
      Pending: 0,
      Processing: 1,
      "To Ship": 1,
      Shipped: 2,
      "Out for Delivery": 2,
      Delivered: 3,
      // "Completed": 3 // if that exists
    };
    currentStepIndex =
      statusIdxMap[status] !== undefined ? statusIdxMap[status] : -1;
  }

  if (isNegativeStatus) {
    return (
      <div className="w-full bg-red-50 border border-red-200 rounded-lg p-6 mb-6 flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-1">
          <FaBan size={20} />
        </div>
        <h3 className="font-black text-red-700 uppercase tracking-widest">
          Order {status}
        </h3>
        <p className="text-sm text-red-600">
          This order has been {status.toLowerCase()}.
        </p>
      </div>
    );
  }

  // Calculate progress bar width
  // 0 -> 0%, 1 -> 33%, 2 -> 66%, 3 -> 100%
  const progressWidth =
    currentStepIndex === -1 ? 0 : (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-6 px-4 md:px-12 mb-6">
      <div className="relative flex justify-between items-center w-full z-0">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full transform -translate-y-1/2" />

        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 rounded-full transform -translate-y-1/2 transition-all duration-700 ease-in-out"
          style={{ width: `${progressWidth}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div
              key={index}
              className="flex flex-col items-center gap-2 relative"
            >
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white shadow-[0px_4px_0px_0px_rgba(21,128,61,1)] transform scale-110"
                    : "bg-white border-gray-300 text-gray-300"
                }`}
              >
                {isCompleted ? (
                  isCurrent ? (
                    <step.icon size={18} />
                  ) : (
                    <FaCheck size={16} />
                  )
                ) : (
                  <step.icon size={18} />
                )}
              </div>

              {/* Label */}
              <div
                className={`absolute top-14 md:top-16 flex flex-col items-center w-32 text-center transition-all duration-500 ${
                  isCompleted ? "opacity-100" : "opacity-60"
                }`}
              >
                <span
                  className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${
                    isCompleted ? "text-green-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] text-green-600 font-bold animate-pulse">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Spacing for labels */}
      <div className="h-12 md:h-14 w-full" />
    </div>
  );
};

export default OrderTracking;
