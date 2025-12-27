import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import Buttons from "../reusable/Buttons";
import { IoIosClose } from "react-icons/io";

export default function ToShipModal({
  selectedRiderId,
  setSelectedRiderId,
  onConfirm,
  onCancel,
  isOpen,
}) {
  const {
    data: getRiders = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["riders", "riderId"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/rider/get-riders`);
      return res.data;
    },
  });

  const handleSelectRider = (id) => {
    setSelectedRiderId(id);
  };

  if (isPending) return <p>Loading...</p>;

  if (isError) return <p>Error.</p>;

  if (!isOpen) return null;

  return (
    <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-sm bg-black/40 px-5 z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-black rounded-lg w-full md:w-[700px] relative  animate-in zoom-in duration-200 p-8 pt-12">
        {/* Floating Sticker Header */}
        <div className="absolute -top-5 -left-4 bg-primary text-white border border-black px-6 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
          <h1 className="font-black uppercase tracking-widest text-sm italic">
            Assign Delivery Rider
          </h1>
        </div>

        <button
          onClick={onCancel}
          type="button"
          className="absolute -top-3 -right-3 bg-red-600 text-white border-2 border-black size-8 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all z-30 group"
        >
          <IoIosClose
            size={24}
            className="group-hover:rotate-90 transition-transform"
          />
        </button>

        {/* BODY */}
        <div className="flex flex-col gap-4">
          <p className="text-[11px] uppercase font-black text-gray-400 tracking-wider ml-1">
            Select a rider to start the shipping process for this order.
          </p>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {getRiders.length > 0 ? (
              getRiders.map((rider) => (
                <div
                  key={rider._id}
                  onClick={() =>
                    rider.riderStatus !== "unavailable" &&
                    handleSelectRider(rider._id)
                  }
                  className={`flex justify-between items-center p-5 rounded-lg border-2 transition-all cursor-pointer group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                    selectedRiderId === rider._id
                      ? "bg-indigo-50 border-indigo-600 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] translate-x-[2px] translate-y-[2px] !shadow-none"
                      : "bg-white border-black"
                  } ${
                    rider.riderStatus === "unavailable"
                      ? "opacity-50 grayscale cursor-not-allowed border-dashed bg-gray-50 shadow-none translate-none"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-gray-400 leading-none">
                          Rider Name
                        </span>
                        <span className="text-sm font-black uppercase tracking-tight">
                          {rider.riderName}
                        </span>
                      </div>
                      <span
                        className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                          rider.riderStatus === "unavailable"
                            ? "bg-red-400 text-white"
                            : "bg-green-400 text-white"
                        }`}
                      >
                        {rider.riderStatus}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-gray-400 leading-none">
                        Contact Info
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600">
                        {rider.riderPhoneNumber}
                      </span>
                    </div>
                  </div>

                  <div>
                    {selectedRiderId === rider._id ? (
                      <div className="bg-indigo-600 text-white px-4 py-2 border-2 border-black rounded-lg text-[13px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Selected ✓
                      </div>
                    ) : (
                      <button
                        disabled={rider.riderStatus === "unavailable"}
                        className="border-2 border-black rounded-lg px-4 py-2 bg-white text-black text-[13px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-primary group-hover:text-white transition-colors disabled:hidden"
                      >
                        Select Rider
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-black rounded-lg bg-gray-50">
                <p className="text-sm font-black uppercase text-gray-400 tracking-widest">
                  No riders available at the moment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 border-t-2 border-black pt-6 flex gap-4 justify-end items-center">
          <button
            onClick={onCancel}
            type="button"
            className="px-8 py-3 border-2 border-black bg-red-600 text-white rounded-lg font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all active:scale-95"
          >
            Cancel
          </button>
          <Buttons
            buttonName="Confirm Selection"
            onClick={onConfirm}
            disabled={!selectedRiderId}
            className="px-8 py-3 !shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:!shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
          />
        </div>
      </div>
    </div>
  );
}
