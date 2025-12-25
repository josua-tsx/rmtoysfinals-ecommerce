import React, { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminRiderTable from "../../pages/admin/AdminRiderTable";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminRider() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  // Add Form State
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
      setShowAdd(false);
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
    <section className="bg-yellow h-screen">
      <AdminHeader title={"RIDER TABLE"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* <AdminStatCard title={"TOTAL PRODUCTS"} value={98}/>
              <AdminStatCard title={"TOTAL CATEGORIES"} value={5}/>
              <AdminStatCard title={"STOCKS"} value={98}/>
              <AdminStatCard title={"SUPPLIERS"} value={5}/> */}
        </div>

        <div className="w-full gap-2  flex ">
          <button
            onClick={() => setShowAdd((prev) => !prev)}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Add Rider
            <IoMdAdd />
          </button>
          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {enableMultiDel ? "Cancel Delete" : "Multiple Delete"}
            <MdDelete />
          </button>
        </div>

        <FormModal
          isOpen={showAdd}
          title="Add Rider"
          onClose={() => setShowAdd(false)}
          onSubmit={handleFormSubmit}
          submitLabel="Add Rider"
          isSubmitting={isPending}
        >
          <div className="flex gap-2 p-2 flex-col w-full">
            <div className="flex flex-col gap-2 w-full justify-between">
              <label htmlFor="riderName">Rider Full Name: </label>
              <input
                type="text"
                id="riderName"
                placeholder="Ex: Brendon Mae"
                value={riderName}
                maxLength={100}
                onChange={handleInputChange(setRiderName)}
                className="border border-black p-1 outline-none  rounded-[5px]"
              />
            </div>
            <div className="flex flex-col gap-2 w-full justify-between">
              <label htmlFor="riderPhoneNum">Rider Phone Number: </label>
              <input
                type="tel"
                id="riderPhoneNum"
                value={riderPhoneNum}
                onChange={(e) => setRiderPhoneNum(e.target.value)}
                placeholder="Ex: 09*******83"
                maxLength={11}
                className="border border-black p-1  outline-none rounded-[5px]"
              />
            </div>
          </div>
        </FormModal>

        <AdminRiderTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
