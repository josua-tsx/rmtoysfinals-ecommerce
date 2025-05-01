import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ArrowLine from "../reusable/ArrowLine";
import { useState } from "react";
import { handleInputChange } from "../reusable/helperFunctions/onChangeInput";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTwo, setShowPasswordTwo] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordTWo = () => {
    setShowPasswordTwo(!showPasswordTwo);
  };

  const { mutate: resetPasswordMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/auth/reset-password`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Reset password succesfullly");
      navigate(`/sign-in`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();

    if (password != confirmPassword) {
      toast.error("Password don't match!");
      return;
    }

    resetPasswordMutation({ token, newPassword: password });
  };

  return (
    <section className="pt-[180px] md:pb-32 h-full bg-yellow p-4 font-main ">
      <div className="max-w-[600px]  mx-auto overflow-hidden">
        <div className="relative px-2  mb-4 flex justify-end w-full">
          <div className="relative flex-1">
            <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"} />
          </div>
          <span className="border bg-[#313031] opacity-80 text-white  py-1 rounded-[5px] px-3">
            Reset Password
          </span>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleResetPasswordSubmit}
          className="relative border flex gap-8 bg-card flex-col border-black p-4 rounded-[5px] pt-[40px] pb-[80px] md:pb-[70px] shadow-lg"
        >
          <div className="flex justify-between flex-col">
            <div className="flex justify-between flex-col">
              <label htmlFor="password" className=" mb-2 ">
                New Password:{" "}
              </label>
              <div className="flex flex-col gap-2 relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  className=" outline-none p-2 bg-transparent w-full border-[#313031] border rounded-[5px]"
                />
                <label
                  htmlFor=""
                  className="absolute right-2 top-4 flex items-center gap-2"
                >
                  <p className="text-xs">Show Password</p>
                  <input
                    type="checkbox"
                    onChange={togglePassword}
                    checked={showPassword}
                    className="border  size-[20px]  border-black"
                  />
                </label>
                <p className="text-sm text-green-700">
                  (Password must be at least 8 characters and contain at least 1
                  uppercase letter, symbol, and number)
                </p>
              </div>
            </div>
            <div className="flex justify-between relative flex-col">
              <label htmlFor="password2" className=" mb-2 ">
                Confirm New password:{" "}
              </label>
              <input
                type={showPasswordTwo ? "Text" : "Password"}
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleInputChange(setConfirmPassword)}
                className=" outline-none p-2 bg-transparent border-[#313031] border rounded-[5px]"
              />
              <label
                htmlFor=""
                className="absolute right-2 top-12 flex items-center gap-2"
              >
                <p className="text-xs">Show Password</p>
                <input
                  type="checkbox"
                  onChange={togglePasswordTWo}
                  checked={showPasswordTwo}
                  className="border  size-[20px]  border-black"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <button
              disabled={isPending}
              className="border border-black p-2 text-white rounded-[5px] bg-primary"
            >
              {isPending ? "Loading.." : "Reset Password"}
            </button>
          </div>

          <div className="absolute rounded-b-[5px] bottom-0 left-0 right-0 mx-auto bg-indigo-500 h-[40px]">
            {/* white background */}
          </div>
        </form>

        <div className="mt-4 flex justify-between">
          <div className="relative flex-1">
            <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"} />
          </div>
          <div className="text-sm  flex items-center gap-2">
            Already have an account?{" "}
            <Link
              to={`/sign-in`}
              className="text-indigo-500 hover:underline  text-[18px]"
            >
              {" "}
              Sign In Here!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
