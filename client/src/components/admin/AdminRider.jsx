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
import { addRiderSchema } from "../../schemas/rider.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminRider() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addRiderSchema),
    defaultValues: {
      riderName: "",
      riderPhoneNumber: "",
    },
  });

  const { mutate: riderAddMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/rider/add-rider`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      reset();
      setShowAdd(false);
      toast.success("Succesfully Added new rider");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const onSubmit = (data) => {
    riderAddMutation(data);
  };

  const toggleShowAdd = () => {
    setShowAdd((prev) => !prev);
    if (!showAdd) reset();
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
                onClick={toggleShowAdd}
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
          onSubmit={handleSubmit(onSubmit)}
          submitLabel="Add Rider"
          isSubmitting={isPending || isSubmitting}
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
                {...register("riderName")}
                error={errors.riderName}
                required
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label
                htmlFor="riderPhoneNumber"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Rider Phone Number
              </label>
              <ValidatedInput
                type="tel"
                id="riderPhoneNumber"
                placeholder="Ex: 0917XXXXXXX"
                {...register("riderPhoneNumber")}
                error={errors.riderPhoneNumber}
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
