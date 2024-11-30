import { useState } from "react";
import { IoIosNotifications } from "react-icons/io";
import { useUserStore } from "../../stores/useUserStore";

export default function AdminNotifications() {
  const [toggleNotif, setToggleNotif] = useState(false);

  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <>
      {currentUser?.role === "admin" ? (
        <div className="relative">
          <button
            onClick={() => setToggleNotif(!toggleNotif)}
            className="relative"
          >
            <IoIosNotifications size={30} />
          </button>
          {toggleNotif ? (
            <div className="absolute border left-[-220px] top-[30px] rounded-[5px] z-50 border-black bg-card">
              <ul className="flex flex-col gap-3 p-3 rounded-[5px]">
                <li>
                  <span className="text-red-500">WARNING:</span> STOCKS ARE LOW
                </li>
                <li>
                  <span className="text-green-500">ORDER:</span> YOU GOT AN
                </li>
                <li>
                  <span className="text-red-500">WARNING:</span> STOCKS ARE LOW
                </li>
                <li>
                  <span className="text-red-500">WARNING:</span> STOCKS ARE LOW
                </li>
              </ul>
            </div>
          ) : (
            <span className="absolute bg-red-600 p-2 h-[20px] top-[50%] w-[20px] text-sm text-white flex items-center justify-center -bottom-2 -right-2 rounded-full">
              13
            </span>
          )}
        </div>
      ) : (
        ""
      )}
    </>
  );
}
