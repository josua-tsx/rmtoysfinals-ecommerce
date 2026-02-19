import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";

export default function AdminAddReasonModal({ singleOrderData, onClose }) {
  const queryClient = useQueryClient();

  const [reason, setReason] = useState("");

  const { mutate: addReasonMutation } = useMutation({
    mutationFn: async ({ id, reason }) => {
      const res = await axiosInstance.put(`/order/add-reason/${id}`, {
        reason,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      setReason("");
      onClose();
      toast.success("Sucessfully Added Reason!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleSubmitReason = (e) => {
    e.preventDefault();

    addReasonMutation({ id: singleOrderData._id, reason: reason });
  };

  return (
    <div className="inset-0 z-50 fixed flex flex-col p-5 justify-center items-center backdrop-blur-md font-main overflow-y-auto">
      <div className="bg-card border border-black rounded-[5px] w-full md:w-[400px] relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-10">
        <div className="absolute -top-6 -left-4 bg-primary border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs transform -rotate-2">
          Adding Reason
        </div>
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-10 right-0 bg-red-600 text-white border border-black px-4 py-1.5 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50 active:scale-95 group font-black"
        >
          <IoIosClose
            size={28}
            className="group-hover:rotate-90 transition-transform"
          />
        </button>

        <form onSubmit={handleSubmitReason} className="p-8 pt-10">
          <div className="flex flex-col gap-4">
            <label
              htmlFor="reason"
              className="font-black uppercase text-xs tracking-wider"
            >
              Reason / Feedback:
            </label>
            <textarea
              onChange={(e) => setReason(e.target.value)}
              value={reason}
              name="reason"
              id="reason"
              placeholder="Enter rejection/cancel reason..."
              className="h-[150px] outline-none p-4 border border-black rounded-[5px] bg-gray-50 focus:bg-white transition-colors resize-none"
              required
              maxLength={500}
            ></textarea>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <button
              className="flex-1 bg-primary text-white border border-black py-3 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
              type="submit"
            >
              SUBMIT REASON
            </button>
            <button
              onClick={onClose}
              type="button"
              className="md:w-[35%] bg-red-600 text-white border border-black py-3 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
