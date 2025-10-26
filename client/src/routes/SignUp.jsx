import { Link, useNavigate } from "react-router-dom";
import ArrowLine from "../reusable/ArrowLine";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import { useState } from "react";
import { handleInputChange } from "../reusable/helperFunctions/onChangeInput";
// import { useUserStore } from "../stores/useUserStore";

export default function SignUp() {
  const navigate = useNavigate();

  // const {setCurrentUser} = useUserStore()

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTwo, setShowPasswordTwo] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toggle the password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordTWo = () => {
    setShowPasswordTwo(!showPasswordTwo);
  };

  const { mutate: signUpMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate(`/sign-in`);
      toast.success("Account created Successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    signUpMutation({ username, email, password, confirmPassword });
  };
  return (
    <section className="pt-[180px] h-full bg-yellow p-4 font-main">
      <div className="max-w-[600px]  mx-auto overflow-hidden">
        <div className="relative px-2  mb-4 flex justify-end w-full">
          <div className="relative flex-1">
            <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"} />
          </div>
          <span className="border bg-[#313031] opacity-80 text-white border-[#313031] py-1 rounded-[5px] px-3">
            SIGN UP
          </span>
        </div>
        <form
          onSubmit={handleFormSubmit}
          className="relative border flex gap-2 bg-card flex-col border-[#313031] p-4 rounded-[5px] pt-[40px] pb-[70px] shadow-lg"
        >
          <div className="flex justify-between flex-col">
            <label htmlFor="email" className=" mb-2">
              Email:{" "}
            </label>
            <input
              type="text"
              name="email"
              id="email"
              value={email}
              placeholder="Ex: example@domain.com"
              onChange={handleInputChange(setEmail)}
              className=" outline-none p-2 bg-white border-[#313031] border rounded-[5px]"
            />
            <p className="text-sm pt-1 text-green-700">
              (Enter a valid email.)
            </p>
          </div>
          <div className="flex justify-between flex-col">
            <label htmlFor="username" className=" mb-2 ">
              Username:{" "}
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              placeholder="Ex: johndoe123"
              onChange={handleInputChange(setUsername)}
              className=" outline-none p-2 bg-white border-[#313031] border rounded-[5px]"
            />
            <p className="text-sm pt-1 text-green-700">
              (Username must be 3-30 characters long and contain no special
              characters.)
            </p>
          </div>
          <div className="flex justify-between flex-col">
            <label htmlFor="password" className=" mb-2 ">
              Password:{" "}
            </label>
            <div className="flex flex-col gap-2 relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={password}
                onChange={handleInputChange(setPassword)}
                className=" outline-none p-2 bg-white w-full border-[#313031] border rounded-[5px]"
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
              Confirm password:{" "}
            </label>
            <input
              type={showPasswordTwo ? "Text" : "Password"}
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              className=" outline-none p-2 bg-white border-[#313031] border rounded-[5px]"
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

          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={isPending}
              className="border p-2 px-5  bg-primary w-[100px] border-black  hover:opacity-95   font-medium text-white rounded-[5px]"
            >
              Sign Up
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
          <div className="text-sm  flex gap-2">
            Already have an account?{" "}
            <Link
              to={`/sign-in`}
              className="text-indigo-500 hover:underline text-[18px] "
            >
              {" "}
              Sign in here!
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
