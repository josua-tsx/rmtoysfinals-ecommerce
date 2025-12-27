import { useState } from "react";
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
      className="border flex flex-col gap-6 relative rounded-[5px] border-black bg-card p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-10"
    >
      <div className="absolute -top-6 -left-4 bg-primary border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs transform -rotate-1">
        Add New Rider
      </div>

      <div className="flex gap-4 p-2 flex-col w-full">
        <div className="flex flex-col gap-2 w-full justify-between">
          <label
            htmlFor=""
            className="font-black uppercase text-[10px] tracking-widest text-gray-500"
          >
            Rider Full Name:{" "}
          </label>
          <input
            type="text"
            placeholder="Ex: Brendon Mae"
            value={riderName}
            maxLength={100}
            onChange={handleInputChange(setRiderName)}
            className="border border-black p-3 outline-none rounded-[5px] bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2 w-full justify-between">
          <label
            htmlFor=""
            className="font-black uppercase text-[10px] tracking-widest text-gray-500"
          >
            Rider Phone Number:{" "}
          </label>
          <input
            type="tel"
            value={riderPhoneNum}
            onChange={(e) => setRiderPhoneNum(e.target.value)}
            placeholder="Ex: 09*******83"
            maxLength={11}
            className="border border-black p-3 outline-none rounded-[5px] bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row p-2 gap-4 mt-2">
        <button
          disabled={isPending}
          className="border outline-none flex-1 bg-primary text-white rounded-[5px] border-black py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
        >
          {isPending ? "ADDING..." : "ADD RIDER"}
        </button>
        <button
          type="button"
          className="bg-red-600 text-white md:w-[25%] border border-black rounded-[5px] py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
          onClick={() => {
            setRiderName("");
            setRiderPhoneNum("");
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
