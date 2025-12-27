import { IoIosClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import Buttons from "../reusable/Buttons";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function ReduceQuantityModal({ isOpen, onClose, singleStock }) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(0);

  const { mutate: reduceQuantityMutation, isPending: isReducingPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await axiosInstance.patch(
          `/stock/reduce-quantity/${singleStock._id}`,
          data
        );
        return res.data;
      },
      onSuccess: () => {
        toast.success("Stock quantity reduced successfully");
        queryClient.invalidateQueries(["allStocks"]);
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Something went wrong");
      },
    });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      return toast.error("Quantity must be greater than 0");
    }
    reduceQuantityMutation({ quantity });
  };

  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 z-[60] backdrop-blur-sm bg-black/50 flex items-center justify-center p-5 font-main">
      <div className="bg-white border border-black rounded-lg w-full md:w-[450px] relative animate-in fade-in zoom-in duration-200 p-8 pt-12">
        {/* Red Sticker Header */}
        <div className="absolute -top-5 -left-4 bg-red-600 text-white border border-black px-6 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
          <h1 className="font-black uppercase tracking-widest text-sm italic">
            Reduce Stock
          </h1>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3 -right-3 bg-red-600 text-white border-2 border-black size-8 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all z-30 group"
        >
          <IoIosClose
            size={24}
            className="group-hover:rotate-90 transition-transform"
          />
        </button>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-end">
              <label
                className="font-black uppercase text-[11px] tracking-widest text-gray-500 ml-1"
                htmlFor="reduceQuantity"
              >
                Quantity to set
              </label>
              <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 border-2 border-red-200 rounded-full mb-1">
                Current: {singleStock?.quantity || 0}
              </span>
            </div>
            <input
              type="number"
              id="reduceQuantity"
              name="reduceQuantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border-2 border-black w-full rounded-lg p-4 outline-none bg-gray-50 focus:bg-white transition-colors text-2xl font-black font-mono shadow-[inner_4px_4px_0px_0px_rgba(0,0,0,0.05)]"
            />
            <p className="text-[10px] font-bold text-gray-400 italic text-center uppercase tracking-tighter mt-1">
              Adjust the value above to decrease or modify inventory levels.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Buttons
              buttonType="submit"
              isLoading={isReducingPending}
              loadingText="Updating..."
              buttonName="Update Quantity"
              icon={<FaCheck size={18} />}
              animateIcon={true}
              className="flex-1 bg-green-500 !text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
            <Buttons
              onClick={onClose}
              buttonName="Close"
              icon={<FaTimes size={18} />}
              animateIcon={true}
              className="md:w-[120px] bg-white !text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        </form>
      </div>
    </section>
  );
}
