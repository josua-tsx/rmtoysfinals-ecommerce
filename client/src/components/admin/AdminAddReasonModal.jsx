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
    <section className="inset-0 z-50 fixed overflow-y-auto md:overflow-y-hidden  p-3">
      <div className="h-screen relative flex flex-col justify-center items-center">
        <form
          onSubmit={handleSubmitReason}
          className="border flex flex-col justify-between relative border-black w-[300px] h-[300px] bg-card rounded-[5px]"
        >
          <button
            onClick={onClose}
            type="button"
            className="absolute border border-black text-card bg-primary rounded-[5px] px-5 right-0 -top-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <IoIosClose size={25} />
          </button>
          <div className="p-2 flex flex-col gap-2 h-full">
            <label htmlFor="reason">Reason: </label>

            <textarea
              onChange={(e) => setReason(e.target.value)}
              value={reason}
              name="reason"
              id="reason"
              className="h-full outline-none p-2 border border-black rounded-[5px]"
            ></textarea>
          </div>

          <button className="rounded-b-[5px] bg-primary py-1 text-card shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            SUBMIT
          </button>
        </form>
      </div>
    </section>
  );
}
