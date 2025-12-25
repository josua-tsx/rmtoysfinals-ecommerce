import { useState } from "react";
import AdminSupplierTable from "../../components/admin/AdminSupplierTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
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
    addSupplierMutation({
      supplierName,
      contactPerson,
      contactNumber,
      supplierAddress,
    });
  };

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
  };

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"SUPPLIER"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* CARD */}
        </div>

        <div className="w-full  flex gap-2">
          <button
            onClick={toggleAddCategory}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Add Supplier
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
          title="Add Supplier"
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddSubmit}
          submitLabel="Add Supplier"
          isSubmitting={isSupplierPending}
        >
          <div className="flex gap-2 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label htmlFor="supplierName" className="uppercase">
                Supplier Name:{" "}
              </label>
              <input
                type="text"
                name="supplierName"
                id="supplierName"
                value={supplierName}
                maxLength={50}
                onChange={handleInputChange(setSupplierName)}
                className="border border-black w-full rounded-[5px] p-1  outline-none"
                required
              />
              <p className="text-sm pt-1 lowercase text-green-700">
                (Supplier name do not allow double spaces, and number. it should
                be between 3 and 50 characters.)
              </p>
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="contactPerson" className="uppercase">
                Contact Person Fulllname :{" "}
              </label>
              <input
                type="text"
                name="contactPerson"
                id="contactPerson"
                value={contactPerson}
                maxLength={100}
                onChange={handleInputChange(setContactPerson)}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
                required
              />
              <p className="text-sm pt-1 lowercase text-green-700">
                (Contact person full name does not allow double spaces.)
              </p>
            </div>

            <div className="flex gap-2 flex-col">
              <label htmlFor="contactNumber" className="uppercase">
                Contact Number:{" "}
              </label>
              <input
                type="tel"
                name="contactNumber"
                id="contactNumber"
                value={contactNumber}
                maxLength={11}
                onChange={handleInputChange(setContactNumber)}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
                required
              />
              <p className="text-sm pt-1 lowercase text-green-700">
                (Phone number should be valid number. It should start with 09
                and exact 11 numbers)
              </p>
            </div>

            <div className="flex gap-2 flex-col">
              <label htmlFor="supplierAddress" className="uppercase">
                Supplier Address:{" "}
              </label>
              <input
                type="text"
                name="supplierAddress"
                id="supplierAddress"
                value={supplierAddress}
                maxLength={200}
                onChange={handleInputChange(setSupplierAddress)}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
                required
              />
            </div>
            <p className="text-sm pt-1 lowercase text-green-700">
              (Supplier address do not allow double spaces and is between 5 and
              200 max characters long.)
            </p>
          </div>
        </FormModal>

        <AdminSupplierTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
