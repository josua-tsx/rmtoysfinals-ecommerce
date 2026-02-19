import { Link, useNavigate } from "react-router-dom";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import { useState } from "react";
import Buttons from "../reusable/Buttons";
import { FaSignInAlt } from "react-icons/fa";
import { signinSchema } from "../schemas/auth.schema";

import PasswordInput from "../reusable/PasswordInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function SignIn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { setCurrentUser } = useUserStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  const [rememberMe, setRememberMe] = useState(false);

  const { data: isAdminExist, isLoading } = useQuery({
    queryKey: ["checkAdminExist"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/check-admin");
      return res.data.hasAdmin;
    },
  });

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: async (userData) => {
      const res = await axiosInstance.post(`/auth/signin`, userData);
      return res.data;
    },
    onSuccess: (userData) => {
      // Store rememberMe preference in localStorage for the store to use
      localStorage.setItem("rememberMe", rememberMe);

      setCurrentUser(userData);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate(`/`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  const onSubmit = (data) => {
    loginMutation(data);
  };

  return (
    <section className=" h-screen p-4 font-main ">
      <div className="max-w-[600px] h-full  flex flex-col justify-center   mx-auto ">
        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
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
              htmlFor="loginId"
              className=" mb-2 uppercase text-[10px] font-black tracking-widest text-gray-500"
            >
              Email or Username :{" "}
            </label>
            <input
              type="text"
              placeholder="Ex: example@domain.com or johndoe123"
              id="loginId"
              maxLength={254}
              {...register("loginId")}
              className={`outline-none p-3 bg-white border-black border rounded-[5px] ${errors.loginId ? "border-red-500" : ""}`}
            />
            {errors.loginId && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.loginId.message}
              </p>
            )}
          </div>

          <PasswordInput
            label="Password:"
            id="password"
            autoComplete="current-password"
            {...register("password")}
            errorText={errors.password?.message}
            className={errors.password ? "border-red-500" : ""}
            maxLength={128}
          />

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium text-gray-700"
            >
              Remember Me
            </label>
          </div>

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
            {/* blue accent */}
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
