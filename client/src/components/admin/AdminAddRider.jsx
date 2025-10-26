import React, { useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminAddRider() {
  const queryClient = useQueryClient();
  const [riderName, setRiderName] = useState("");
  const [riderPhoneNum, setRiderPhoneNum] = useState("");

  const { mutate: riderAddMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/rider/add-rider`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      setRiderName("");
      setRiderPhoneNum("");
      toast.success("Succesfully Added new rider");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!riderName) {
      return toast.error("Rider name is required");
    }

    if (!riderPhoneNum) {
      return toast.error("Rider phone number is required");
    }

    riderAddMutation({ riderName, riderPhoneNumber: riderPhoneNum });
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="border flex flex-col gap-5 relative rounded-[5px] border-black bg-card"
    >
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

      <div className="flex gap-2 p-2 flex-col w-full">
        <div className="flex flex-col gap-2 w-full justify-between">
          <label htmlFor="">Rider Full Name: </label>
          <input
            type="text"
            placeholder="Ex: Brendon Mae"
            value={riderName}
            maxLength={100}
            onChange={handleInputChange(setRiderName)}
            className="border border-black p-1 outline-none  rounded-[5px]"
          />
        </div>
        <div className="flex flex-col gap-2 w-full justify-between">
          <label htmlFor="">Rider Phone Number: </label>
          <input
            type="tel"
            value={riderPhoneNum}
            onChange={(e) => setRiderPhoneNum(e.target.value)}
            placeholder="Ex: 09*******83"
            maxLength={11}
            className="border border-black p-1  outline-none rounded-[5px]"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row p-2 gap-2">
        <button
          disabled={isPending}
          className="border outline-none flex-1 bg-primary text-card rounded-[5px] border-black p-2"
        >
          {isPending ? "Loading..." : "ADD RIDER"}
        </button>
        <button
          //   onClick={handleClear}

          type="button"
          className="bg-red-600 w-full p-2 md:w-[20%] border border-black rounded-[5px] text-card "
        >
          Clear
        </button>
      </div>
    </form>
  );
}
