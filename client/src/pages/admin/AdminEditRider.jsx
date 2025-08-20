import React from "react";
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
  }, [singleRider._id]);

  const handleUpdateSubmit = (e) => {
    e.preventDefault();

    updateRiderMutation({ riderName, riderPhoneNumber: riderPhoneNum });
  };

  if (riderPending) return <p>Loading...</p>;
  if (isError) return <p>Error.</p>;

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"EDIT VAT"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form
          onSubmit={handleUpdateSubmit}
          className="border flex flex-col gap-5 relative rounded-[5px] border-black bg-card"
        >
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className="flex gap-2 p-2 flex-col w-full">
            <div className="flex flex-col gap-2 w-full justify-between">
              <label htmlFor="">Rider Name: </label>
              <input
                type="text"
                placeholder="Ex: Brendon Mae"
                value={riderName}
                onChange={handleInputChange(setRiderName)}
                className="border border-black p-1 outline-none  rounded-[5px]"
              />
            </div>
            <div className="flex flex-col gap-2 w-full justify-between">
              <label htmlFor="">Rider Phone Number: </label>
              <input
                type="number"
                value={riderPhoneNum}
                onChange={(e) => setRiderPhoneNum(e.target.value)}
                placeholder="Ex: 09*******83"
                className="border border-black p-1  outline-none rounded-[5px]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row p-2 gap-2">
            <button
              disabled={isPending}
              className="border outline-none flex-1 bg-primary text-card rounded-[5px] border-black p-2"
            >
              {isPending ? "Loading..." : "Update Rider"}
            </button>
            <button
              onClick={() => navigate("/admin/rider")}
              type="button"
              className="bg-red-600 w-full p-2 md:w-[20%] border border-black rounded-[5px] text-card "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
