import { useState } from "react";
import { createSupplierSchema } from "../../schemas/supplier.schema";
import AdminSupplierTable from "../../components/admin/AdminSupplierTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import ValidatedInput from "../../reusable/ValidatedInput";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminSupplier() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      supplierName: "",
      contactPerson: "",
      contactNumber: "",
      supplierAddress: "",
      enableNotifications: true,
    },
  });

  const enableNotifications = watch("enableNotifications");

  const { mutate: addSupplierMutation, isPending: isSupplierPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await axiosInstance.post(`/supplier/add-supplier`, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supplier"] });
        toast.success("Added Successfully!");
        reset();
        setShowAdd(false);
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong");
      },
    });

  const onSubmit = (data) => {
    addSupplierMutation(data);
  };

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
    if (!showAdd) reset();
  };

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"SUPPLIER"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <div className="flex gap-4">
              <button
                onClick={toggleAddCategory}
                className="flex items-center gap-3 bg-indigo-600 text-white border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group"
              >
                {showAdd ? "CANCEL ADD" : "ADD SUPPLIER"}
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
          title="Add Supplier"
          onClose={() => setShowAdd(false)}
          onSubmit={handleSubmit(onSubmit)}
          submitLabel="ADD SUPPLIER"
          isSubmitting={isSupplierPending || isSubmitting}
        >
          <div className="flex gap-4 p-2 flex-col">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="supplierName"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
              >
                Supplier Name
              </label>
              <ValidatedInput
                id="supplierName"
                {...register("supplierName")}
                error={errors.supplierName}
                placeholder="Ex: Toy Kingdom"
                required
              />
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                (3-50 chars, no double spaces or numbers)
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contactPerson"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
              >
                Contact Person Full Name
              </label>
              <ValidatedInput
                id="contactPerson"
                {...register("contactPerson")}
                error={errors.contactPerson}
                placeholder="Ex: Juan Dela Cruz"
                required
              />
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                (No double spaces allowed)
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contactNumber"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
              >
                Contact Number
              </label>
              <ValidatedInput
                type="tel"
                id="contactNumber"
                {...register("contactNumber")}
                error={errors.contactNumber}
                placeholder="Ex: 09123456789"
                required
              />
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                (Starts with 09, exactly 11 digits)
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="supplierAddress"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500"
              >
                Supplier Address
              </label>
              <ValidatedInput
                type="textarea"
                id="supplierAddress"
                {...register("supplierAddress")}
                error={errors.supplierAddress}
                placeholder="Ex: 123 Toy St., Manila City"
                className="h-[100px] resize-none"
                required
              />
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                (5-200 chars, no double spaces)
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="addEnableNotifications"
                checked={enableNotifications}
                onChange={(e) =>
                  setValue("enableNotifications", e.target.checked)
                }
                className="w-5 h-5 border border-black rounded-[3px] accent-green-500 cursor-pointer"
              />
              <label
                htmlFor="addEnableNotifications"
                className="font-black uppercase text-[11px] tracking-widest text-black cursor-pointer"
              >
                Enable Low Stock Notifications
              </label>
            </div>
          </div>
        </FormModal>

        <AdminSupplierTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
