import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getGuestCart } from "../../lib/utils";
import { useEffect, useState } from "react";

export default function GuestCart() {
  const [itemCount, setItemCount] = useState(0);

  const useCartListener = () => {
    useEffect(() => {
      const checkCartChanges = () => {
        const cart = getGuestCart();
        const count = cart?.items?.length;
        setItemCount(count);
      };

      // Check immediately on mount
      checkCartChanges();

      // Set up storage event listener
      const handleStorageChange = (e) => {
        if (e.key === "guestCart") {
          checkCartChanges();
        }
      };

      // Set up interval as fallback
      const intervalId = setInterval(checkCartChanges, 1000);

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        clearInterval(intervalId);
      };
    }, []);
  };

  useCartListener();

  return (
    <div className="font-main">
      <Link to="/guest-cart" className="relative">
        <FaShoppingCart size={25} />

        {itemCount > 0 && (
          <span
            className="absolute bg-red-600 p-2 h-[20px] min-w-[20px] flex text-sm text-white 
                        items-center justify-center -bottom-2 -right-[9.5px] rounded-full"
          >
            {itemCount}
          </span>
        )}
      </Link>
    </div>
  );
}
