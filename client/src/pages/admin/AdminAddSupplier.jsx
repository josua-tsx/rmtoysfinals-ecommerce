import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { useNavigate } from "react-router-dom";

export default function AdminAddSupplier() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const {
    mutate: addSupplierMutation,
    isPending: isSupplierPending,
    isError: isSupplierError,
  } = useMutation({
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
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const handleClear = () => {
    setSupplierName("");
    setContactPerson("");
    setContactNumber("");
    setSupplierAddress("");
  };

  const handleSupplierSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const {
      supplierName,
      contactPerson,
      contactNumber,
      supplierPay,
      supplierAddress,
    } = inputs;
    addSupplierMutation({
      supplierName,
      contactPerson,
      contactNumber,
      supplierPay,
      supplierAddress,
    });
  };

  if (isSupplierPending) {
    <p>loading...</p>;
  }
  if (isSupplierError) {
    <p>loading...</p>;
  }

  return (
    <form
      onSubmit={handleSupplierSubmit}
      className="border flex flex-col gap-5 relative rounded-[5px] border-black bg-card"
    >
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className="flex gap-2 p-2 flex-col">
        <div className="flex gap-2 flex-col">
          <label htmlFor="" className="uppercase">
            Supplier Name:{" "}
          </label>
          <input
            type="text"
            name="supplierName"
            id="supplierName"
            value={supplierName}
            onChange={handleInputChange(setSupplierName)}
            className="border border-black w-full rounded-[5px] p-1  outline-none"
          />
          <p className="text-sm pt-1 lowercase text-green-700">
            (Supplier name do not allow double spaces, and number. it should be
            between 3 and 50 characters.)
          </p>
        </div>
        <div className="flex gap-2 flex-col">
          <label htmlFor="" className="uppercase">
            Contact Person Fulllname :{" "}
          </label>
          <input
            type="text"
            name="contactPerson"
            id="contactPerson"
            value={contactPerson}
            onChange={handleInputChange(setContactPerson)}
            className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
          />
          <p className="text-sm pt-1 lowercase text-green-700">
            (Contact person full name does not allow double spaces.)
          </p>
        </div>

        <div className="flex gap-2 flex-col">
          <label htmlFor="" className="uppercase">
            Contact Number:{" "}
          </label>
          <input
            type="number"
            min={0}
            name="contactNumber"
            id="contactNumber"
            value={contactNumber}
            onChange={handleInputChange(setContactNumber)}
            className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
          />
          <p className="text-sm pt-1 lowercase text-green-700">
            (Phone number should be valid number. It should start with 09 and
            exact 11 numbers)
          </p>
        </div>

        <div className="flex gap-2 flex-col">
          <label htmlFor="" className="uppercase">
            Supplier Address:{" "}
          </label>
          <input
            type="text"
            name="supplierAddress"
            id="supplierAddress"
            value={supplierAddress}
            onChange={handleInputChange(setSupplierAddress)}
            className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
          />
        </div>
        <p className="text-sm pt-1 lowercase text-green-700">
          (Supplier address do not allow double spaces and is between 5 and 200
          max characters long.)
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-2 p-2">
        <button className="border flex-1 border-black rounded-[5px] bg-primary text-card p-2">
          Add Supplier
        </button>
        <button
          type="button"
          className="bg-red-600 w-full p-2 md:w-[20%] border border-black rounded-[5px] text-card "
          onClick={handleClear}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
