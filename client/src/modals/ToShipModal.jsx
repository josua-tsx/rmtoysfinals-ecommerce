import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";

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
    <div className="fixed font-main inset-0 flex items-center justify-center backdrop-blur-sm px-5 z-50">
      <div className="border border-black flex flex-col gap-4 bg-card text-black rounded-[5px] p-5 w-full  md:w-[850px]">
        {/* HEADER */}
        <div>
          <h1 className="text-lg">Select rider for this deliver</h1>
        </div>

        {/* BODU */}
        <div className="flex flex-col gap-2 ">
          {getRiders.length > 0 &&
            getRiders.map((rider) => (
              <div
                key={rider._id}
                className={`flex justify-between border ${
                  selectedRiderId === rider._id ? "bg-blue-200" : ""
                } border-black p-2 rounded-[5px] items-center ${
                  rider.riderStatus === "unavailable"
                    ? "bg-red-500 text-white"
                    : "text-black"
                }`}
              >
                <div className="flex gap-2">
                  <p>Rider Name: </p>
                  <p>{rider.riderName}</p>
                </div>

                <div className="flex gap-2">
                  <p>Rider Status: </p>
                  <p>{rider.riderStatus}</p>
                </div>
                <div className="flex gap-2">
                  <p>Rider Phone#:</p>
                  <p>{rider.riderPhoneNumber}</p>
                </div>
                <div>
                  <button
                    disabled={rider.riderStatus === "unavailable"}
                    onClick={() => handleSelectRider(rider._id)}
                    className="border border-black rounded-[5px] p-2 bg-primary text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    {rider.riderStatus === "unavailable"
                      ? "Unavailable"
                      : "Select This Rider"}
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* BUTTONS */}

        <div className="flex gap-2 pt-4 justify-center">
          <button
            onClick={onConfirm}
            className="border rounded-[5px] px-4 border-black bg-primary p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="border rounded-[5px] px-4 border-black bg-red-600 p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
