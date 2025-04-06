import { useEffect, useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminEditVat() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams();

  const [vatPercent, setVatPercent] = useState(0);

  const {
    data: singleVat,
    isPending: singleVatPending,
    isError: singleVatError,
  } = useQuery({
    queryKey: ["singleVat", params.vatId],
    queryFn: async () => {
      const { vatId } = params;
      const res = await axiosInstance.get(`/vat/get-vat/${vatId}`);
      return res.data;
    },
    enabled: !!params.vatId,
  });

  useEffect(() => {
    if (singleVat) {
        setVatPercent(singleVat.vatPercent)
    }
  }, [singleVat])


  const {mutate: updateVatMutation} = useMutation({
    mutationFn: async (data) => {
        const res = await axiosInstance.put(`/vat/edit-vat/${singleVat._id}`, data)
        return res.data
    },
    onSuccess: () => {
        toast.success("Updated succesfully!")
        queryClient.invalidateQueries({queryKey: ["vats"]})
        navigate(`/admin/vat`)
    },
    onError: (err) => {
        toast.error(err.response.data.message || "something went wrong!")
    }
  })

  const handleFormSubmit = (e) => {
    e.preventDefault()

    updateVatMutation({
        vatPercent
    })
  }


  if (singleVatPending) return <p>Loading...</p>
  if (singleVatError) return <p>Error.</p>
  
  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"EDIT VAT"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form onSubmit={handleFormSubmit}
        className="border flex flex-col gap-5  rounded-[5px] relative border-black bg-card">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className="flex gap-2 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label htmlFor="vat">VAT%: </label>
              <input
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(e.target.value)}
                id="vat"
                name="vat"
                min={0}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 p-2">
            <button className="border flex-1 border-black bg-primary text-card rounded-[5px] uppercase p-2">
              Update Vat
            </button>
            <button
              onClick={() => navigate(`/admin/vat`)}
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
