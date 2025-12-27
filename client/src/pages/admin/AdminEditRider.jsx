import { useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function AdminEditRider() {
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();
  const [riderName, setRiderName] = useState("");
  const [riderPhoneNum, setRiderPhoneNum] = useState(0);

  const {
    data: singleRider = {},
    isPending: riderPending,
    isError,
  } = useQuery({
    queryKey: ["rider"],
    queryFn: async () => {
      const { riderId } = params;
      const res = await axiosInstance.get(`/rider/get-rider/${riderId}`);
      return res.data;
    },
    enabled: !!params.riderId,
  });

  console.log(singleRider);

  const { mutate: updateRiderMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/rider/edit-rider/${singleRider._id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      navigate("/admin/rider");
      toast.success("Rider updated succesfully!");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  useEffect(() => {
    if (singleRider) {
      setRiderName(singleRider.riderName);
      setRiderPhoneNum(singleRider.riderPhoneNumber);
    }
  }, [singleRider]);

  const handleUpdateSubmit = (e) => {
    e.preventDefault();

    updateRiderMutation({ riderName, riderPhoneNumber: riderPhoneNum });
  };

  if (riderPending) return <p>Loading...</p>;
  if (isError) return <p>Error.</p>;

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"EDIT RIDER"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form
          onSubmit={handleUpdateSubmit}
          className="border flex flex-col gap-6 relative rounded-[5px] border-black bg-card p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-10"
        >
          <div className="absolute -top-6 -left-4 bg-primary border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs transform -rotate-1">
            Edit Rider Profile
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
                className="border border-black p-3 outline-none rounded-[5px] bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row p-2 gap-4 mt-2">
            <button
              disabled={isPending}
              className="border outline-none flex-1 bg-primary text-white rounded-[5px] border-black py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
            >
              {isPending ? "UPDATING..." : "UPDATE RIDER"}
            </button>
            <button
              onClick={() => navigate("/admin/rider")}
              type="button"
              className="bg-red-600 text-white md:w-[25%] border border-black rounded-[5px] py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
