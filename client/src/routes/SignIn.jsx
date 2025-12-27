import { Link, useNavigate } from "react-router-dom";

import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import { useState } from "react";
import { handleInputChange } from "../reusable/helperFunctions/onChangeInput";
import Buttons from "../reusable/Buttons";
import { FaSignInAlt } from "react-icons/fa";

import PasswordInput from "../reusable/PasswordInput";

export default function SignIn() {
  const navigate = useNavigate();

  const { setCurrentUser } = useUserStore();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const { data: isAdminExist, isLoading } = useQuery({
    queryKey: ["checkAdminExist"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/check-admin");
      return res.data.hasAdmin;
    },
  });

  console.log(isAdminExist);

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: async (userData) => {
      const res = await axiosInstance.post(`/auth/signin`, userData);
      return res.data;
    },
    onSuccess: (userData) => {
      setCurrentUser(userData);
      setLoginId("");
      setPassword("");
      navigate(`/`);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    try {
      loginMutation({ loginId, password });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className=" h-screen p-4 font-main ">
      <div className="max-w-[600px] h-full  flex flex-col justify-center   mx-auto ">
        {/* FORM */}
        <form
          onSubmit={handleFormSubmit}
          className="relative border flex gap-2 bg-card flex-col border-black p-4 rounded-[5px] pt-[40px] pb-[80px] md:pb-[70px] shadow-lg mt-8"
        >
          {/* Sticker Header */}
          <div className="absolute -top-5 -left-4 bg-[#22c55e] text-white border border-black px-6 py-2.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-30">
            <h1 className="font-black uppercase tracking-widest text-sm italic">
              SIGN IN
            </h1>
          </div>
          <div className="flex justify-between flex-col">
            <label
              htmlFor="email"
              className=" mb-2 uppercase text-[10px] font-black tracking-widest text-gray-500"
            >
              Email or Username :{" "}
            </label>
            <input
              type="text"
              placeholder="Ex: example@domain.com or johndoe123"
              name="email"
              id="email"
              value={loginId}
              onChange={handleInputChange(setLoginId)}
              maxLength={246}
              className="outline-none p-3 bg-white border-black border rounded-[5px]"
            />
          </div>

          <PasswordInput
            label="Password:"
            name="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            autoComplete="current-password"
          />

          <div className="flex justify-center items-center relative  gap-2">
            <Buttons
              buttonName="Sign In"
              isLoading={isPending}
              loadingText="Signing In..."
              icon={<FaSignInAlt size={20} />}
              animateIcon={true}
              className="mt-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              buttonType="submit"
            />

            <div className="text-sm absolute -bottom-8 right-0 md:top-[50%] md:bottom-[50%]  items-center gap-2">
              <Link
                to={`/recover-password`}
                className="text-indigo-500 hover:underline  "
              >
                {" "}
                Forget password
              </Link>
            </div>
          </div>

          <div className="absolute rounded-b-[5px] bottom-0 left-0 right-0 mx-auto bg-indigo-500 h-[40px]">
            {/* white background */}
          </div>
        </form>

        <div className="mt-8 flex justify-end">
          <div className="text-sm flex items-center gap-2">
            No account yet?
            <Link
              to={`/sign-up`}
              className="text-indigo-500 hover:underline  text-[18px]"
            >
              {" "}
              {!isLoading && isAdminExist
                ? "Sign Up Here!"
                : "Create Admin Account"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
