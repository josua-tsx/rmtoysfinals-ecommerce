import {  useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaSignOutAlt } from "react-icons/fa";
import { useUserStore } from "../../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export default function Settings() {
  const [showSetting, setShowSetting] = useState(false)

    const currentUser = useUserStore(state => state.currentUser)
    const {clearUser} = useUserStore()

    const navigate = useNavigate()


    const {mutate: signOut} =  useMutation({
      mutationFn: async () => await axiosInstance.post(`auth/signout`),
      onSuccess: () => {
        navigate("/sign-in")
        clearUser()
      }
    })



  return (
    <div className="relative font-main">
      <button onClick={() => setShowSetting(!showSetting)} className="relative">
        <BsThreeDotsVertical size={25} />
      </button>
      <div className={`absolute ${showSetting ? "block" : "hidden"} left-[30px] top-[-120px] lg:top-[45px] lg:-left-[170px] w-[180px] rounded-[5px] p-3 border-black border bg-card`}>
        <ul className="flex flex-col justify-end h-full gap-2">
            {
              currentUser.role === "admin" || currentUser.role === "validatorStaff" ? <li className="border-b-gray-300 uppercase p-1 hover:bg-gray-300 border">
              <Link to={`${currentUser.role === "admin" ? `/admin` : `/validator`}`} className=" flex justify-between items-center" onClick={() => setShowSetting(false)} >
                dashboard
                <TbLayoutDashboardFilled size={20} />
              </Link>
            </li> : ""
            }
            <li className="uppercase p-1 hover:bg-gray-300 ">
              <Link to={`/profile`} onClick={() => setShowSetting(false)} className=" flex justify-between items-center">
                profile
                <CgProfile size={20} />
              </Link>
            </li>
            <li className=" p-1 hover:bg-gray-300">
              <button onClick={() => signOut()} 
              className=" uppercase flex justify-between w-full items-center"  >
                Sign out
                <FaSignOutAlt size={20} />
              </button>
            </li>
        </ul>
      </div>
    </div>
  );
}
