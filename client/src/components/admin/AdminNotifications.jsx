import { useEffect, useState } from "react";
import { IoIosNotifications } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminNotifications() {
  const [toggleNotif, setToggleNotif] = useState(false);

  const {
    data: notificationLogs = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["notificationLogs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/notification/get`);
      return res.data;
    },
  });


  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error.</p>;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setToggleNotif(!toggleNotif)}
          className="relative"
        >
          <IoIosNotifications size={30} />
        </button>
        {toggleNotif ? (
          <div className="absolute border right-2 top-10 w-[300px] rounded-[5px] z-50 border-black bg-card">
            <ul className="flex flex-col gap-3 p-3 rounded-[5px]">
              {notificationLogs.length > 0 ? (
                notificationLogs.map((notif) => (
                  <li key={notif._id} className="flex gap-2">
                    <p className="text-green-600">{notif.notificationType}</p>:
                    <p className="text-indigo-600">
                      {notif?.notificationDetails?.description}
                    </p>
                  </li>
                ))
              ) : ( 
                <p>no notifications.</p>
              )}
            </ul>
          </div>
        ) : (
          <div>
            {notificationLogs && notificationLogs.length > 0 ? (
              <span className="absolute bg-red-600 p-2 h-[20px] top-[50%] w-[20px] text-sm text-white flex items-center justify-center -bottom-2 -right-2 rounded-full">
                {notificationLogs.length}
              </span>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
    </>
  );
}
