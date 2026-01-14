import { useState } from "react";
import {
  createSupplierSchema,
  supplierNameSchema,
  supplierAddressSchema,
} from "../../schemas/supplier.schema";
import { phMobileSchema, fullNameSchema } from "../../schemas/common.schema";
import AdminSupplierTable from "../../components/admin/AdminSupplierTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import ValidatedInput from "../../reusable/ValidatedInput";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminSupplier() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  // Add Form State
  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const { mutate: addSupplierMutation, isPending: isSupplierPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await axiosInstance.post(`/supplier/add-supplier`, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["supplier"] });
        toast.success("Added Successfully!");
        setSupplierName("");
        setContactPerson("");
        setContactNumber("");
        setSupplierAddress("");
        setShowAdd(false);
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong");
      },
    });

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const data = {
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
    };

    const result = createSupplierSchema.safeParse(data);

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    addSupplierMutation(result.data);
  };

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
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
          onSubmit={handleAddSubmit}
          submitLabel="ADD SUPPLIER"
          isSubmitting={isSupplierPending}
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
                name="supplierName"
                value={supplierName}
                onChange={handleInputChange(setSupplierName)}
                schema={supplierNameSchema}
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
                name="contactPerson"
                value={contactPerson}
                onChange={handleInputChange(setContactPerson)}
                schema={fullNameSchema}
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
                name="contactNumber"
                value={contactNumber}
                onChange={handleInputChange(setContactNumber)}
                schema={phMobileSchema}
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
                name="supplierAddress"
                value={supplierAddress}
                onChange={handleInputChange(setSupplierAddress)}
                schema={supplierAddressSchema}
                placeholder="Ex: 123 Toy St., Manila City"
                className="h-[100px] resize-none"
                required
              />
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">
                (5-200 chars, no double spaces)
              </p>
            </div>
          </div>
        </FormModal>

        <AdminSupplierTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
