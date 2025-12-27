import { useEffect, useState } from "react";

export default function CreditPointsAuto({ className }) {
  const [showCreditInfo, setShowCreditInfo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCreditInfo((prev) => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full mb-4 h-8 ${className}`}>
      <div
        className={`absolute transition-all duration-1000 ease-in-out px-4 py-1 bg-blue-700 text-white border border-black rounded-[5px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[10px] md:text-xs font-black uppercase tracking-widest text-center transform ${
          showCreditInfo
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2"
        }`}
      >
        ★ Earn credit points with every purchase! ★
      </div>
    </div>
  );
}
