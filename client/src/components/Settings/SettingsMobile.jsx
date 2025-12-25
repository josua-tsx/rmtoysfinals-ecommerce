import { Link, useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaSignOutAlt } from "react-icons/fa";
import { useUserStore } from "../../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";

export default function SettingsMobile({ toggle }) {
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
    <>
      {currentUser?.role === "admin" ||
      currentUser?.role === "validatorStaff" ? (
        <li>
          <Link
            to={`${currentUser?.role === "admin" ? `/admin` : `/validator`}`}
            onClick={toggle}
          >
            <button className="hover:bg-primary w-full p-1 hover:text-white text-lg flex justify-between items-center">
              Dashboard
              <TbLayoutDashboardFilled size={20} />
            </button>
          </Link>
        </li>
      ) : null}

      <li>
        <Link to={`/profile`} onClick={toggle}>
          <button className="hover:bg-primary w-full p-1 hover:text-white text-lg flex justify-between items-center">
            Profile
            <CgProfile size={20} />
          </button>
        </Link>
      </li>

      <li>
        <button
          onClick={() => {
            signOut();
            console.log("sign out");
            if (toggle) toggle();
          }}
          className="hover:bg-primary w-full p-1 hover:text-white text-lg flex justify-between items-center"
        >
          Sign out
          <FaSignOutAlt size={20} />
        </button>
      </li>
    </>
  );
}
