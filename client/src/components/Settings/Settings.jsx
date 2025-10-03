import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaSignOutAlt } from "react-icons/fa";
import { useUserStore } from "../../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export default function Settings({ toggle, openSetting }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const { clearUser } = useUserStore();

  const navigate = useNavigate();

  const { mutate: signOut } = useMutation({
    mutationFn: async () => await axiosInstance.post(`auth/signout`),
    onSuccess: () => {
      navigate("/sign-in");
      clearUser();
    },
  });

  return (
    <div className="relative font-main text-sm md:text-normal">
      <button onClick={toggle} className="relative">
        <BsThreeDotsVertical size={25} />
      </button>
      <div
        className={`absolute ${
          openSetting ? "block" : "hidden"
        } left-[30px] top-[0] lg:top-[45px] lg:-left-[170px] w-[150px] md:w-[180px] rounded-[5px] p-3 border-black border bg-card`}
      >
        <ul className="flex flex-col justify-end h-full gap-2">
          {currentUser.role === "admin" ||
          currentUser.role === "validatorStaff" ? (
            <li className=" p-1 hover:bg-gray-300 ">
              <Link
                to={`${currentUser.role === "admin" ? `/admin` : `/validator`}`}
                className=" flex justify-between items-center"
                onClick={toggle}
              >
                Dashboard
                <TbLayoutDashboardFilled size={20} />
              </Link>
            </li>
          ) : (
            ""
          )}
          <li className=" p-1 hover:bg-gray-300 ">
            <Link
              to={`/profile`}
              onClick={toggle}
              className=" flex justify-between items-center"
            >
              Profile
              <CgProfile size={20} />
            </Link>
          </li>
          <li className=" p-1 hover:bg-gray-300">
            <button
              onClick={() => {
                signOut()
                console.log("sign out")
              }}
              className="  flex justify-between w-full items-center"
            >
              Sign out
              <FaSignOutAlt size={20} />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
