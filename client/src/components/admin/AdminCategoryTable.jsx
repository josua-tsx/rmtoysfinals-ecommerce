import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import FormModal from "../../reusable/FormModal";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminCategoryTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const {
    data: categories = [],
    isPending: isCategoryPending,
    isError: isCategoryError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/category/get-categories`);
      return res.data;
    },
  });

  const arrayCategories = Array.isArray(categories) ? categories : [];

  const numSelected = selectedIds.length;
  const numProducts = arrayCategories.length;

  // Checkbox is ticked only if all products are selected
  const allSelected = numProducts > 0 && numSelected === numProducts;

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

  const pushMultipleCate = (categoryId) => {
    setSelectedIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(arrayCategories.map((category) => category._id));
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
    setCategoryName(category.categoryName);
    setCategoryDescription(category.categoryDescription);
    setIsOpenEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editCategoryMutation({ categoryName, categoryDescription });
  };

  const filterdArrayCategories = arrayCategories.filter(
    (category) =>
      category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category._id.includes(searchTerm),
  );

  if (isCategoryError) {
    <p>loading...</p>;
  }

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          Category Table
        </h1>
      </div>

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
        onSubmit={handleEditSubmit}
        submitLabel="Update Category"
        isSubmitting={isEditPending}
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
            <input
              type="text"
              name="categoryName"
              id="editCategoryName"
              value={categoryName}
              maxLength={50}
              onChange={handleInputChange(setCategoryName)}
              className="border border-black w-full rounded-[5px] p-2 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
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
            <textarea
              name="categoryDescription"
              id="editCategoryDescription"
              value={categoryDescription}
              maxLength={200}
              onChange={handleInputChange(setCategoryDescription)}
              className="border border-black w-full rounded-[5px] p-2 h-[100px] focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold resize-none"
            />
          </div>
        </div>
      </FormModal>

      <div className="flex-col border-b-2 border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Categories
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Electronics..."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[600px] py-3">
        {isCategoryPending ? (
          <div className="p-4">
            <AdminTableSkeleton />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black relative">
              <tr>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Category Name
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Description
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Products Count
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Actions
                </th>
                {arrayCategories.length > 0 && enableMultiDel && (
                  <th className="p-4 pb-2 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                    />
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filterdArrayCategories.length > 0 ? (
                filterdArrayCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap uppercase tracking-tight text-black">
                      {category?.categoryName}
                    </td>

                    <td className="p-4 text-gray-600 max-w-[300px] truncate">
                      {category?.categoryDescription}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {category?.products?.length} Products
                      </span>
                    </td>

                    <td className="p-4">
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
                    </td>
                    {enableMultiDel && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(category._id)}
                          onChange={() => pushMultipleCate(category._id)}
                          className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center font-black uppercase text-gray-400 tracking-widest"
                  >
                    no categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedIds && selectedIds.length > 0 && (
        <div className="w-full flex gap-3 justify-end p-4 border-t border-black bg-gray-50">
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
    </div>
  );
}
