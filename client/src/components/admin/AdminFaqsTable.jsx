import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import FormModal from "../../reusable/FormModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ValidatedInput from "../../reusable/ValidatedInput";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

// FAQ Schema
const faqSchema = z.object({
  title: z
    .string({ required_error: "Question is required" })
    .min(5, "Question must be at least 5 characters")
    .max(100, "Question cannot exceed 100 characters"),
  answer: z
    .string({ required_error: "Answer is required" })
    .min(10, "Answer must be at least 10 characters")
    .max(500, "Answer cannot exceed 500 characters"),
});

export default function AdminFaqsTable({ enableMultiDel }) {
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  // Edit Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      title: "",
      answer: "",
    },
  });

  const {
    data,
    isPending: isLoading,
    isError,
  } = useQuery({
    queryKey: ["faqs", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/faqs/get-all-faqs?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const faqsTable = data?.faqs || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

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
      reset();
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

  // Selection Logic for ReusableTable
  const handleSelect = (faqId) => {
    setSelectedIds((prev) =>
      prev.includes(faqId)
        ? prev.filter((id) => id !== faqId)
        : [...prev, faqId],
    );
  };

  const handleSelectAll = () => {
    const allOnPageSelected =
      faqsTable.length > 0 &&
      faqsTable.every((f) => selectedIds.includes(f._id));

    if (allOnPageSelected) {
      // Unselect all on current page
      const newSelected = selectedIds.filter(
        (id) => !faqsTable.map((f) => f._id).includes(id),
      );
      setSelectedIds(newSelected);
    } else {
      // Select all on current page
      const currentIds = faqsTable.map((f) => f._id);
      const uniqueIds = [...new Set([...selectedIds, ...currentIds])];
      setSelectedIds(uniqueIds);
    }
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

  const openDeleteModal = (id) => {
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
    reset({
      title: faq.title,
      answer: faq.answer,
    });
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (data) => {
    updateFaqMutation(data);
  };

  if (isError) return <p>Error loading FAQs</p>;

  // Column Definitions
  const columns = [
    {
      header: "Question",
      className: "uppercase text-black text-left",
      render: (faq) => (
        <p className="max-w-[200px] line-clamp-2">{faq?.title}</p>
      ),
    },
    {
      header: "Response",
      className: "text-left",
      render: (faq) => (
        <div className="bg-white border border-dashed border-gray-200 p-2 rounded-[5px] hover:border-black transition-colors">
          <p className="max-w-[400px] line-clamp-2 text-gray-600 italic">
            {faq?.answer}
          </p>
        </div>
      ),
    },
    {
      header: "Created",
      className: "text-center text-black",
      render: (faq) => (
        <span className="text-gray-500">
          {new Date(faq.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (faq) => (
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
      ),
    },
  ];

  return (
    <>
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
        onSubmit={handleSubmit(handleEditSubmit)}
        submitLabel="SAVE CHANGES"
        isSubmitting={isEditPending || isSubmitting}
      >
        <div className="flex gap-6 p-4 flex-col bg-gray-50/50">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="editTitle"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Question
            </label>
            <ValidatedInput
              id="editTitle"
              type="text"
              {...register("title")}
              error={errors.title}
              required
              maxLength={100}
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
              id="editAnswer"
              rows={4}
              {...register("answer")}
              className={`border ${errors.answer ? "border-red-500" : "border-black"} w-full rounded-[5px] p-3 font-bold text-sm bg-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none`}
              required
              maxLength={500}
            ></textarea>
            {errors.answer && (
              <p className="text-red-500 text-xs font-bold">
                {errors.answer.message}
              </p>
            )}
          </div>
        </div>
      </FormModal>

      <ReusableTable
        title="Knowledge Base List"
        columns={columns}
        data={faqsTable}
        isLoading={isLoading}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "Search FAQs...",
        }}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: totalItems,
          onPageChange: setPage,
        }}
        selection={
          enableMultiDel
            ? {
                selectedIds,
                onSelect: handleSelect,
                onSelectAll: handleSelectAll,
              }
            : undefined
        }
        emptyMessage="No knowledge base entries found"
      />

      {selectedIds && selectedIds.length > 0 && (
        <div className="relative w-full flex justify-end">
          <div className="absolute -bottom-0 right-0 flex gap-4 p-4 bg-white border border-black rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 mt-4">
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
        </div>
      )}
    </>
  );
}
