import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import { IoSearch } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminFaqsTable() {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const {
    data: faqsTable = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/faqs/get-faqs`);
      return res.data;
    },
  });

  const { mutate: deleteFaqMutation, isPending } = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/faqs/delete-faq/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("Faq succesfully deleted!");
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const openDeleteModal = (id) => {
    console.log(id);
    setOpenModal(true);
    setSelectedId(id);
  };

  const confirmDeleteModal = () => {
    deleteFaqMutation(selectedId);
    cancelDeleteModal();
  };

  const cancelDeleteModal = () => {
    setSelectedId(null);
    setOpenModal(false);
  };

  if (isError) return <p>Error</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative ">
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      {/* CARD */}

      <ConfirmModal
        isOpen={openModal}
        title={"Confirm delete"}
        message={
          "Are you sure you want to delete this FAQ? This action cannot be undone."
        }
        onConfirm={confirmDeleteModal}
        onCancel={cancelDeleteModal}
      />

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>VAT TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            placeholder="search vat.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto h-[600px] py-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr className="flex justify-between">
                <th className="font-normal p-2 pb-5">Title</th>
                <th className="font-normal p-2 pb-5">Answer</th>
                <th className="font-normal p-2 pb-5">Date Added</th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {faqsTable.length > 0 ? (
                faqsTable.map((faq) => (
                  <tr
                    key={faq._id}
                    className="flex items-center justify-between"
                  >
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {faq?.title}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {faq?.answer}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {" "}
                      {new Date(faq.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button className="text-green-600 hover:text-indigo-300 mr-2">
                        <CiEdit size={25} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(faq._id)}
                        className="text-red-600 hover:text-red-300"
                      >
                        <MdDelete size={25} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <p>No faqs.</p>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
