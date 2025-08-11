import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import { IoSearch } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AdminFaqsTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

  const pushMultiFaqs = (faqId) => {
    setSelectedId((prev) =>
      prev.includes(faqId)
        ? prev.filter((id) => id !== faqId)
        : [...prev, faqId]
    );
  };

  const cancelMultiDelete = () => {
    setSelectedIds([]);
  };

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

  const { mutate: deleteAllFaqs } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/faqs/delete-multi-faqs`, {
        faqIds: data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("Faqs are deleted successfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  const handleDeletMulti = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one faq");
      return;
    }

    if (
      window.confirm(
        `Are you sure wou want to dlete ${selectedIds.length} faqs?`
      )
    ) {
      deleteAllFaqs(selectedIds);
    }
  };

  const navigateToEdit = (id) => {
    navigate(`/admin/editFaq/${id}`);
  };

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
        <h1>FAQS TABLE</h1>
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
                      <button
                        type="button"
                        onClick={() => navigateToEdit(faq._id)}
                        className="text-green-600 hover:text-indigo-300 mr-2"
                      >
                        <CiEdit size={25} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(faq._id)}
                        className="text-red-600 hover:text-red-300"
                      >
                        <MdDelete size={25} />
                      </button>

                      {enableMultiDel ? (
                        <input
                          type="checkbox"
                          id="wdwadwk"
                          checked={selectedIds.includes(faq._id)}
                          onChange={() => pushMultiFaqs(faq._id)}
                        />
                      ) : (
                        ""
                      )}
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
      {selectedIds && selectedIds.length > 0 && (
        <div className=" w-full flex gap-2 justify-end p-3">
          <button
            onClick={cancelMultiDelete}
            className="border bg-green-700 text-white rounded-[5px] border-black p-2"
          >
            Cancel Detete
          </button>
          <button
            onClick={() => handleDeletMulti()}
            className="border bg-red-700 text-white rounded-[5px] border-black p-2"
          >
            Confirm Detete
          </button>
        </div>
      )}
    </div>
  );
}
