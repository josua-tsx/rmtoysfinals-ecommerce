import React from "react";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

export default function VerifyEmailComponent() {
  const currentUser = useUserStore((state) => state.currentUser);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  console.log(token);

  const { mutate: verifyEmailMutation, isPending } = useMutation({
    mutationFn: async (token) => {
      const res = await axiosInstance.post(`/user/confirm-email`, token);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Successfully Verified Email");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response.data.message) || "Something went wrong";
    },
  });

  const handleVerifySubmit = () => {
    verifyEmailMutation({ token });
  };

  return (
    <div className="flex flex-col h-screen font-main justify-center items-center p-4">
      <div className="border  gap-4 border-black bg-card p-4 text-center w-[100%] md:max-w-[450px] h-[250px] rounded-[5px] flex flex-col items-center justify-center ">
        <h1 className="text-2xl">Verify your email</h1>
        <p className="flex gap-2 flex-col items-center">
          Ar you sure you want to verify this email?
          <span className="text-blue-500">{currentUser.email}</span>
        </p>
        <div className="flex gap-4 mt-4">
          <button
            disabled={isPending}
            onClick={() => handleVerifySubmit()}
            className="border border-black p-2 px-3 rounded-[5px] bg-primary text-card  "
          >
            Confirm
          </button>
          <button
            onClick={() => navigate("/")}
            className="border border-black p-2 px-3 rounded-[5px] bg-red-500 text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
