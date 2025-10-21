import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";

export default function AdminVatTable() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [isOpenModal, setIsOpenModal] = useState(false)
    const [selectedId, setSelectedId] = useState(null)

  const {
    data: vatTable = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/vat/get-vat`);
      return res.data;
    },
  });


  const {mutate: deleteVatMutation} = useMutation({
    mutationFn: async (vatId) => {
        const res = await axiosInstance.delete(`/vat/delete-vat/${vatId}`)
        return res.data
    },
    onSuccess: () => {
        toast.success("Deleted Vat")
        queryClient.invalidateQueries({queryKey: ["vats"]})
    },
    onError: (err) => {
        toast.error(err.response.data.message || "something went wrong!")
    }
  })


  const handleClickDelete = (vatId) => {
    setSelectedId(vatId)
    setIsOpenModal(true)
  }

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteVatMutation(selectedId)
      setIsOpenModal(false)
    }
  }

  const handleCancelDelete = () => {
    setSelectedId(null)
    setIsOpenModal(false)
  }

  if (isError) return <p>Error</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative ">
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      {/* CARD */}

      <ConfirmModal
              isOpen={isOpenModal}
              title={"Confirm delete"}
              message={
                "This data might in used in different module, are you sure you want to delete this VAT? This action cannot be undone."
              }
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>VAT TABLE</h1>
      
      </div>
      <div className="overflow-y-auto h-full py-3">
        {
          isLoading ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner/>
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr className="flex justify-between">
              {/* <th className="font-normal p-2 pb-5">ID</th> */}
              <th className="font-normal p-2 pb-5">VAT Percent</th>
              <th className="font-normal p-2 pb-5">VAT Value</th>
              <th className="font-normal p-2 pb-5">VAT Products in use</th>
              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {
                vatTable.length > 0 ? (
                    vatTable.map((vat) => (
                        <tr key={vat._id}
                         className="flex items-center justify-between">
              {/* <td className="px-4 ">{vat._id}</td> */}
              <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                {vat?.vatPercent}%
              </td>
              <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                {vat?.vatValue}%
              </td>
              <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                {vat?.productId?.length}
              </td>

              <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                <button onClick={() => navigate(`/admin/editVat/${vat._id}`)}
                className="text-green-600 hover:text-indigo-300 mr-2">
                  <CiEdit size={25} />
                </button>
                <button onClick={() => handleClickDelete(vat._id)}
                className="text-red-600 hover:text-red-300">
                  <MdDelete size={25} />
                </button>
              </td>
            </tr>
                    ))
                ) : <p>no vat.</p>
            }
          </tbody>
        </table>
          )
        }
      </div>
    </div>
  );
}
