import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";
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
      const res = await axiosInstance.get(`/faqs/get-all-faqs`);
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
        data,
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
        : [...prev, faqId],
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
        `Are you sure wou want to dlete ${selectedIds.length} faqs?`,
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
    <div className="font-main text-sm md:text-normal border rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Amber Sticker Header for FAQs */}
      <div className="absolute -top-4 -left-3 bg-[#f59e0b] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          Knowledge Base List
        </h1>
      </div>

      <ConfirmModal
        isOpen={openModal}
        title={"Confirm Deletion"}
        message={
          "Are you sure you want to delete this FAQ entry? This action cannot be undone."
        }
        onConfirm={confirmDeleteModal}
        onCancel={cancelDeleteModal}
      />

      {/* Edit FAQ Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Update FAQ Entry"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleEditSubmit}
        submitLabel="SAVE CHANGES"
        isSubmitting={isEditPending}
      >
        <div className="flex gap-6 p-4 flex-col bg-gray-50/50">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="editTitle"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Question
            </label>
            <input
              name="title"
              id="editTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="border-2 border-black w-full rounded-[5px] p-3 font-bold text-sm bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="editAnswer"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Answer
            </label>
            <textarea
              name="answer"
              id="editAnswer"
              rows={4}
              value={answer}
              maxLength={500}
              onChange={(e) => setAnswer(e.target.value)}
              className="border border-black w-full rounded-[5px] p-3 font-bold text-sm bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
              required
            ></textarea>
          </div>
        </div>
      </FormModal>

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 pt-8 bg-gray-50/50">
        <div className="hidden md:block">
          <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
            Displaying {faqsTable.length} Frequently Asked Questions
          </p>
        </div>
        {enableMultiDel && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-600 px-4 py-1.5 rounded-full">
            <span className="font-black uppercase text-[10px] text-red-600">
              Selecting for Batch Delete
            </span>
            <div className="size-2 bg-red-600 rounded-full animate-ping"></div>
          </div>
        )}
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4">
            <AdminTableSkeleton />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-black">
                {enableMultiDel && (
                  <th className="px-4 py-4 text-center border-r border-black w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="size-4 cursor-pointer accent-black"
                    />
                  </th>
                )}
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  Question
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  Response
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  Created
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest text-black">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {faqsTable.length > 0 ? (
                faqsTable.map((faq) => (
                  <tr
                    key={faq._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {enableMultiDel && (
                      <td className="px-4 py-4 border-r border-black text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(faq._id)}
                          onChange={() => pushMultiFaqs(faq._id)}
                          className="size-4 cursor-pointer accent-black"
                        />
                      </td>
                    )}
                    <td className="px-4 py-4 border-r border-black">
                      <p className="uppercase max-w-[200px] line-clamp-2 text-black">
                        {faq?.title}
                      </p>
                    </td>
                    <td className="px-4 py-4 border-r border-black">
                      <div className="bg-white border border-dashed border-gray-200 p-2 rounded-[5px] group-hover:border-black transition-colors">
                        <p className="max-w-[400px] line-clamp-2 text-gray-600 italic">
                          {faq?.answer}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r border-black text-center text-black">
                      <span className="text-gray-500">
                        {new Date(faq.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(faq)}
                          className="bg-indigo-50 text-indigo-600 border border-indigo-600 size-10 flex items-center justify-center rounded-[5px] shadow-[3px_3px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          title="Edit Entry"
                        >
                          <CiEdit size={22} />
                        </button>
                        <button
                          disabled={isDeleting}
                          onClick={() => openDeleteModal(faq._id)}
                          className="bg-red-50 text-red-600 border border-red-600 size-10 flex items-center justify-center rounded-[5px] shadow-[3px_3px_0px_0px_rgba(220,38,38,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                          title="Remove Entry"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={enableMultiDel ? 5 : 4}
                    className="p-12 text-center text-gray-400 font-black uppercase tracking-widest text-xs"
                  >
                    No knowledge base entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {selectedIds && selectedIds.length > 0 && (
        <div className="absolute -bottom-16 right-0 flex gap-4 p-4 bg-white border border-black rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
          <button
            onClick={cancelMultiDelete}
            className="bg-white text-black border border-black py-2 px-6 rounded-[5px] font-black uppercase text-xs hover:bg-gray-50 transition-colors"
          >
            CANCEL SELECTION
          </button>
          <button
            onClick={() => handleDeletMulti()}
            className="bg-red-500 text-white border border-black py-2 px-6 rounded-[5px] font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            DELETE SELECTED ({selectedIds.length})
          </button>
        </div>
      )}
    </div>
  );
}
