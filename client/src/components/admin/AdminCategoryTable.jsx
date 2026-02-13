import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategorySchema } from "../../schemas/category.schema";
import ValidatedInput from "../../reusable/ValidatedInput";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminCategoryTable({ enableMultiDel }) {
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed limit for now

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // Edit Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      categoryName: "",
      categoryDescription: "",
    },
  });

  const {
    data,
    isPending: isCategoryPending,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["categories", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/category/get-categories?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const categories = Array.isArray(data)
    ? data
    : Array.isArray(data?.categories)
      ? data.categories
      : [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || categories.length;
  const currentPage = data?.currentPage || 1;

  // --- EDIT MUTATION ---
  const { mutate: editCategoryMutation, isPending: isEditPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await axiosInstance.put(
          `/category/edit-category/${selectedCategory._id}`,
          data,
        );
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success("Successfully Edited!");
        setIsOpenEditModal(false);
        setSelectedCategory(null);
        reset();
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong!");
      },
    });

  const { mutate: deleteCategoryMutation } = useMutation({
    mutationFn: async (categoryId) => {
      const res = await axiosInstance.delete(
        `/category/delete-category/${categoryId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category Deleted Successfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const { mutate: deleteAllCategories } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/category/delete-multi-category`, {
        categoryIds: data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categories are deleted succesfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

  // Selection Logic for ReusableTable
  const handleSelect = (categoryId) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleSelectAll = () => {
    const allOnPageSelected =
      categories.length > 0 &&
      categories.every((c) => selectedIds.includes(c._id));

    if (allOnPageSelected) {
      // Unselect all on current page
      const newSelected = selectedIds.filter(
        (id) => !categories.map((c) => c._id).includes(id),
      );
      setSelectedIds(newSelected);
    } else {
      // Select all on current page
      const currentIds = categories.map((c) => c._id);
      const uniqueIds = [...new Set([...selectedIds, ...currentIds])];
      setSelectedIds(uniqueIds);
    }
  };

  const cancelMultiDelete = () => {
    setSelectedIds([]);
  };

  const handleClickDelete = (categoryId) => {
    setSelectedId(categoryId);
    setIsOpenModal(true);
  };

  const handleConfirm = () => {
    if (selectedId) {
      deleteCategoryMutation(selectedId);
      setIsOpenModal(false);
    }
  };

  const handleDelteMulti = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} categories?`,
      )
    ) {
      deleteAllCategories(selectedIds);
    }
  };

  const handleCancel = () => {
    setSelectedId(null);
    setIsOpenModal(false);
  };

  // --- EDIT HANDLERS ---
  const handleOpenEditModal = (category) => {
    setSelectedCategory(category);
    reset({
      categoryName: category.categoryName,
      categoryDescription: category.categoryDescription,
    });
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (data) => {
    editCategoryMutation(data);
  };

  if (isCategoryError) {
    return <p>Error loading categories</p>;
  }

  // Column Definitions
  const columns = [
    {
      header: "Category Name",
      className: "text-left",
      render: (category) => (
        <span className="uppercase tracking-tight text-black">
          {category?.categoryName}
        </span>
      ),
    },
    {
      header: "Description",
      className: "text-left",
      render: (category) => (
        <span className="text-gray-600 max-w-[300px] truncate block">
          {category?.categoryDescription}
        </span>
      ),
    },
    {
      header: "Products Count",
      render: (category) => (
        <span className="px-3 py-1 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {category?.products?.length || 0} Products
        </span>
      ),
    },
    {
      header: "Actions",
      render: (category) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenEditModal(category)}
            title="Edit"
            className="p-2 border border-black bg-yellow-400 text-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <CiEdit size={18} />
          </button>
          <button
            onClick={() => handleClickDelete(category._id)}
            title="Delete"
            className="p-2 border border-black bg-red-500 text-white rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <MdDelete size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ConfirmModal
        isOpen={isOpenModal}
        title={"Confirm delete"}
        message={
          "This data might in used in different module, are you sure you want to delete this Category? This action cannot be undone."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Edit Category Modal */}
      <FormModal
        isOpen={isOpenEditModal}
        title="Edit Category"
        onClose={() => setIsOpenEditModal(false)}
        onSubmit={handleSubmit(handleEditSubmit)}
        submitLabel="Update Category"
        isSubmitting={isEditPending || isSubmitting}
      >
        <div className="flex gap-2 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label
              htmlFor="editCategoryName"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Category Name:{" "}
              <span className="text-[10px] text-green-700 normal-case font-bold block mt-1">
                (No spaces or numbers allowed. 3-50 characters.)
              </span>
            </label>
            <ValidatedInput
              id="editCategoryName"
              {...register("categoryName")}
              error={errors.categoryName}
              placeholder="Enter category name"
              required
            />
          </div>
          <div className="flex gap-2 flex-col">
            <label
              htmlFor="editCategoryDescription"
              className="font-black uppercase text-xs tracking-widest text-gray-500"
            >
              Category Description:{" "}
            </label>
            <ValidatedInput
              type="textarea"
              id="editCategoryDescription"
              {...register("categoryDescription")}
              error={errors.categoryDescription}
              className="h-[100px]"
              placeholder="Enter category description"
            />
          </div>
        </div>
      </FormModal>

      <ReusableTable
        title="Category Table"
        columns={columns}
        data={categories}
        isLoading={isCategoryPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "Ex: Electronics...",
        }}
        pagination={{
          currentPage: currentPage, // Use the page from backend response for sync
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
        emptyMessage="no categories found"
      />

      {selectedIds && selectedIds.length > 0 && (
        <div className="w-full flex gap-3 justify-end p-4 border border-t-0 border-black bg-gray-50 rounded-b-[5px] mt-[-6px] relative z-10">
          <button
            onClick={cancelMultiDelete}
            className="px-6 py-2 border border-black bg-white font-black uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelteMulti()}
            className="px-6 py-2 border border-black bg-red-600 text-white font-black uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}
    </>
  );
}
