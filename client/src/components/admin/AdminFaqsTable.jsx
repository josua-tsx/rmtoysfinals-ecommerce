import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect } from "react";
import FormModal from "../../reusable/FormModal";

export default function AdminFaqsTable({ enableMultiDel }) {
  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [title, setTitle] = useState("");
  const [answer, setAnswer] = useState("");

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

  const numSelected = selectedIds.length;
  const numProducts = faqsTable.length;

  const allSelected = numProducts > 0 && numSelected === numProducts;

  // --- EDIT MUTATION ---
  const { mutate: updateFaqMutation, isPending: isEditPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/faqs/update-faq/${selectedFaq._id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("Updated Succesfully!");
      setIsOpenEditModal(false);
      setSelectedFaq(null);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

  const pushMultiFaqs = (faqId) => {
    setSelectedIds((prev) =>
      prev.includes(faqId)
        ? prev.filter((id) => id !== faqId)
        : [...prev, faqId]
    );
  };

  const cancelMultiDelete = () => {
    setSelectedIds([]);
  };

  const { mutate: deleteFaqMutation, isPending: isDeleting } = useMutation({
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

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(faqsTable.map((category) => category._id));
    }
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

  // --- EDIT HANDLERS ---
  const handleOpenEditModal = (faq) => {
    setSelectedFaq(faq);
    setTitle(faq.title);
    setAnswer(faq.answer);
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateFaqMutation({ title, answer });
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

      {/* Edit FAQ Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Edit FAQ"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleEditSubmit}
        submitLabel="Update FAQ"
        isSubmitting={isEditPending}
      >
        <div className="flex gap-2 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label htmlFor="editTitle">Faqs Title: </label>
            <input
              name="title"
              id="editTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="border border-black w-full rounded-[5px] p-1 outline-none"
              required
            />
          </div>
          <div className="flex gap-2 flex-col">
            <label htmlFor="editAnswer">Faqs Answer: </label>
            <input
              name="answer"
              id="editAnswer"
              type="text"
              value={answer}
              maxLength={500}
              onChange={(e) => setAnswer(e.target.value)}
              className="border border-black w-full rounded-[5px] p-1 outline-none"
              required
            />
          </div>
        </div>
      </FormModal>

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>FAQS TABLE</h1>
      </div>
      <div className="overflow-y-auto  py-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead className="relative">
              <tr className="flex justify-between">
                <th className="font-normal p-2 pb-5">Title</th>
                <th className="font-normal p-2 pb-5">Answer</th>
                <th className="font-normal p-2 pb-5">Date Added</th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
                {faqsTable.length > 0 && enableMultiDel && (
                  <input
                    type="checkbox"
                    // onChange={() => pushMultipleProd(product._id)}
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="absolute right-4 top-7"
                  />
                )}
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
                    <td className="px-2 py-4 w-[500px] whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {faq?.answer}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm uppercase truncate font-medium flex items-center gap-2	">
                      {" "}
                      {new Date(faq.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-between">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(faq)}
                          className="text-green-600 hover:text-indigo-300 mr-2"
                        >
                          <CiEdit size={25} />
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => openDeleteModal(faq._id)}
                          className="text-red-600 hover:text-red-300"
                        >
                          <MdDelete size={25} />
                        </button>
                      </div>

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
            className="border bg-green-700 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel Detete
          </button>
          <button
            onClick={() => handleDeletMulti()}
            className="border bg-red-700 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Confirm Detete
          </button>
        </div>
      )}
    </div>
  );
}
