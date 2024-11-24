import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminAddSupplier() {

  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({queryKey: ['supplier']})
      toast.success("Added Successfully!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

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

    try {
      addSupplierMutation({
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

  if (isSupplierPending) {
    <p>loading...</p>;
  }
  if (isSupplierError) {
    <p>loading...</p>;
  }

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"ADD NEW SUPPLIER"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col">
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
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col p-2">
            <button className="border border-black rounded-[5px] bg-primary text-card p-2">
              ADD SUPPLIER
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
