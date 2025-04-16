import { useEffect, useState } from "react";

export default function CreditPointsAuto() {
  const [showCreditInfo, setShowCreditInfo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCreditInfo((prev) => !prev);
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full mb-10 md:mb-5 h-10">
      <div
        className={`absolute transition-opacity duration-1000 ease-in-out px-4 py-2 bg-blue-700 text-white rounded-md shadow-lg text-sm md:text-normal ${
          showCreditInfo ? "opacity-100" : "opacity-0"
        }`}
      >
        Earn credit points with every purchase! Use them as a discount on your
        next order.
      </div>
    </div>
  );
}
