import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminEditSupplier() {
  const queryClient = useQueryClient();
  const params = useParams();
  const navigate = useNavigate();

  const [currentSupplier, setCurrentSupplier] = useState({});

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
      setCurrentSupplier(singleSupplier);
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

  const handleChange = (e) => {
    setCurrentSupplier({
      ...currentSupplier,
      [e.target.name]: e.target.value,
    });
  };

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
      e.target.reset()
    } catch (error) {
      console.log(error);
    }
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
                value={currentSupplier.supplierName}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="uppercase">
                Contact Person :{" "}
              </label>
              <input
                type="text"
                name="contactPerson"
                id="contactPerson"
                value={currentSupplier.contactPerson}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
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
                value={currentSupplier.contactNumber}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="uppercase">
                Method:{" "}
              </label>
              <input
                type="text"
                name="supplierPay"
                id="supplierPay"
                value={currentSupplier.supplierPay}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="uppercase">
                Supplier Address:{" "}
              </label>
              <input
                type="text"
                name="supplierAddress"
                id="supplierAddress"
                value={currentSupplier.supplierAddress}
                onChange={handleChange}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col p-2">
            <button className="border bg-primary text-card rounded-[5px] border-black p-2">
              UPDATE SUPPLIER
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
