import { Link } from "react-router-dom";
import ArrowLine from "../reusable/ArrowLine";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");

  const { mutate: forgetPasswordMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/auth/forget-password`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Sent! Please check your email");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  console.log(email);

  const handleForgetPasswordSubmit = (e) => {
    e.preventDefault();

    forgetPasswordMutation({ email });
  };

  return (
    <section className="pt-[180px] md:pb-32 h-full bg-yellow p-4 font-main ">
      <div className="max-w-[600px]  mx-auto overflow-hidden">
        <div className="relative px-2  mb-4 flex justify-end w-full">
          <div className="relative flex-1">
            <ArrowLine arrowWidth={"90%"} bottomNeg={"50%"} arrowLeft={"0px"} />
          </div>
          <span className="border bg-[#313031] opacity-80 text-white  py-1 rounded-[5px] px-3">
            Forget Password
          </span>
        </div>
   
        {/* FORM */}
        <form
          onSubmit={handleForgetPasswordSubmit}
          className="relative border flex gap-8 bg-card flex-col border-black p-4 rounded-[5px] pt-[40px] pb-[80px] md:pb-[70px] shadow-lg"
        >
          <div className="flex justify-between flex-col">
            <div className="bg-yellow-50 border-l-4 text-red-700 mb-4 text-sm border-red-700 p-4 ">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex flex-col gap-2">
                  <p className="text-md ">
                    <strong>Important:</strong> Your email must be valid—this is
                    where we’ll send your password reset instructions.
                  </p>
                </div>
              </div>
            </div>
            <label htmlFor="email" className=" mb-2">
              Email
            </label>
            <input
              type="text"
              placeholder="Ex: example@domain.com"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="outline-none p-2 bg-transparent border-black border rounded-[5px]"
            />
          </div>

          <div className="flex justify-center w-full">
            <button
              disabled={isPending}
              className="border border-black p-2 text-white rounded-[5px] bg-primary"
            >
              {isPending ? "Loading..." : "Send Code"}
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
