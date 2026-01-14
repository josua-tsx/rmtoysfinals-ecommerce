import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminRiderTable from "../../pages/admin/AdminRiderTable";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import ValidatedInput from "../../reusable/ValidatedInput";
import { addRiderSchema, riderNameSchema } from "../../schemas/rider.schema";
import { phMobileSchema } from "../../schemas/auth.schema";

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
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const result = addRiderSchema.safeParse({
      riderName,
      riderPhoneNumber: riderPhoneNum,
    });

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    riderAddMutation(result.data);
  };

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20 font-main">
      <AdminHeader title={"RIDER TABLE"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAdd((prev) => !prev)}
                className="flex items-center gap-3 bg-indigo-600 text-white border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group"
              >
                {showAdd ? "CANCEL ADD" : "ADD RIDER"}
                <IoMdAdd
                  className={`text-xl transition-transform ${
                    showAdd ? "rotate-45" : "group-hover:scale-125"
                  }`}
                />
              </button>

              <button
                onClick={() => setEnableMultiDel(!enableMultiDel)}
                className={`flex items-center gap-3 border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group ${
                  enableMultiDel
                    ? "bg-red-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                {enableMultiDel ? "STOP DELETE" : "BATCH DELETE"}
                <MdDelete
                  className={`text-xl ${enableMultiDel ? "" : "text-red-600"}`}
                />
              </button>
            </div>
          </div>
        </div>

        <FormModal
          isOpen={showAdd}
          title="Add Rider"
          onClose={() => setShowAdd(false)}
          onSubmit={handleFormSubmit}
          submitLabel="Add Rider"
          isSubmitting={isPending}
        >
          <div className="flex gap-4 p-2 flex-col w-full">
            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="riderName"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Rider Full Name
              </label>
              <ValidatedInput
                type="text"
                id="riderName"
                placeholder="Ex: Juan Dela Cruz"
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                schema={riderNameSchema}
                required
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="riderPhoneNum"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Rider Phone Number
              </label>
              <ValidatedInput
                type="tel"
                id="riderPhoneNum"
                value={riderPhoneNum}
                onChange={(e) => setRiderPhoneNum(e.target.value)}
                placeholder="Ex: 0917XXXXXXX"
                schema={phMobileSchema}
                required
              />
            </div>
          </div>
        </FormModal>

        <AdminRiderTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
