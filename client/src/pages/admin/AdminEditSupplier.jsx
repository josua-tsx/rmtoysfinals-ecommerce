import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminEditSupplier() {
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();

  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [supplierPay, setSupplierPay] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");

  const {
    data: singleSupplier,
    isPending: isSinglePending,
    isError: isSingleError,
  } = useQuery({
    queryKey: ["supplier", params.editSupplierId],
    queryFn: async () => {
      const { editSupplierId } = params;
      const res = await axiosInstance.get(
        `/supplier/get-supplier/${editSupplierId}`
      );
      if (!res.data) return console.log("no data found!");
      return res.data;
    },
    enabled: !!params.editSupplierId,
  });

  useEffect(() => {
    if (singleSupplier) {
      setSupplierName(singleSupplier.supplierName);
      setContactPerson(singleSupplier.contactPerson);
      setContactNumber(singleSupplier.contactNumber);
      setSupplierPay(singleSupplier.supplierPay);
      setSupplierAddress(singleSupplier.supplierAddress);
    }
  }, [singleSupplier]);

  const {
    mutate: editSupplierMutation,
    isPending: isEditPending,
    isError: isEditError,
  } = useMutation({
    mutationFn: async (data) => {
      const { editSupplierId } = params;
      const res = await axiosInstance.put(
        `/supplier/edit-supplier/${editSupplierId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier"] });
      toast.success("Successfully Edited!");
      navigate(`/admin/supplier`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const handleEditSupplierSubmit = (e) => {
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

    try {
      editSupplierMutation({
        supplierName,
        contactPerson,
        contactNumber,
        supplierPay,
        supplierAddress,
      });
      e.target.reset();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/supplier`);
  };

  if (isSinglePending || isEditPending) {
    <p>loading...</p>;
  }

  if (isSingleError || isEditError) {
    <p>loading...</p>;
  }

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"EDIT SUPPLIER"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleEditSupplierSubmit}
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
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
              <p className="text-sm pt-1 lowercase text-green-700">
                (Supplier name do not allow double spaces, and number. it should
                be between 3 and 50 characters.)
              </p>
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="uppercase">
                Contact Person Fullname :{" "}
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
                (Phone number should be valid number. It should start with 09
                and exact 11 numbers)
              </p>
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="uppercase">
                Method:{" "}
              </label>
              <input
                type="text"
                name="supplierPay"
                id="supplierPay"
                value={supplierPay}
                onChange={handleInputChange(setSupplierPay)}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
              <p className="text-sm pt-1 lowercase text-green-700">
                (Supplier pay do not allow double sapces. It should be between 3
                and 50 characters.)
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
              (Supplier address do not allow double spaces and is between 5 and
              200 max characters long.)
            </p>
          </div>

          <div className="flex gap-2 p-2">
            <button className="border flex-1 bg-primary text-card rounded-[5px] border-black p-2">
              UPDATE SUPPLIER
            </button>
            <button
              onClick={() => handleCancel()}
              type="button"
              className="bg-red-600 w-[20%] border border-black rounded-[5px] text-card "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
