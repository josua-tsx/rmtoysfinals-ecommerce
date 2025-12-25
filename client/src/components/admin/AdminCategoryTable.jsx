import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import FormModal from "../../reusable/FormModal";
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
          data
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
        `/category/delete-category/${categoryId}`
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
        : [...prev, categoryId]
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
        `Are you sure you want to delete ${selectedIds.length} categories?`
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
      category._id.includes(searchTerm)
  );

  if (isCategoryError) {
    <p>loading...</p>;
  }

  return (
    <div className="font-main border text-sm md:text-normal  rounded-[5px] border-black bg-card relative ">
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

      {/* CARD */}

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
            <label htmlFor="editCategoryName" className="">
              CATEGORY NAME:{" "}
              <p className="text-sm pt-1  text-green-700">
                (Category name do not allow spaces and number. It should be
                between 3 to 50 max characters.)
              </p>
            </label>
            <input
              type="text"
              name="categoryName"
              id="editCategoryName"
              value={categoryName}
              maxLength={50}
              onChange={handleInputChange(setCategoryName)}
              className="border border-black w-full rounded-[5px] p-1 h-[50px] outline-none"
              required
            />
          </div>
          <div className="flex gap-2 flex-col">
            <label htmlFor="editCategoryDescription" className="">
              CATEGORY DESCRIPTION :{" "}
            </label>
            <textarea
              type="text"
              name="categoryDescription"
              id="editCategoryDescription"
              value={categoryDescription}
              maxLength={200}
              onChange={handleInputChange(setCategoryDescription)}
              className="border resize-none border-black w-full rounded-[5px] p-1 h-[50px] outline-none"
            />
          </div>
        </div>
      </FormModal>

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>CATEGORY TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search category.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isCategoryPending ? (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead className="relative">
              <tr className="">
                {/* <th className="font-normal p-2 pb-5">ID</th> */}
                <th className="font-normal p-2 pb-5">Category Name</th>
                <th className="font-normal p-2 pb-5">Category Description</th>
                <th className="font-normal p-2 pb-5">
                  Category Products Count in use
                </th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
                {arrayCategories.length > 0 && enableMultiDel && (
                  <input
                    type="checkbox"
                    // onChange={() => pushMultipleProd(product._id)}
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="absolute right-4 top-2"
                  />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filterdArrayCategories.length > 0 &&
                filterdArrayCategories.map((category) => (
                  <tr key={category._id}>
                    {/* <td className="px-4 ">{category._id}</td> */}

                    <td className="	p-2">{category?.categoryName}</td>

                    <td className="">{category?.categoryDescription}</td>
                    <td className="">{category?.products?.length}</td>
                    {/* <td className="">
                    {category?.products.length}
                  </td> */}

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-between items-center">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleOpenEditModal(category)}
                          className="text-green-600 hover:text-indigo-300 mr-2"
                        >
                          <CiEdit size={25} />
                        </button>
                        <button
                          onClick={() => handleClickDelete(category._id)}
                          className="text-red-600 hover:text-red-300"
                        >
                          <MdDelete size={25} />
                        </button>
                      </div>

                      {enableMultiDel && (
                        <input
                          type="checkbox"
                          id="wdwadwk"
                          checked={selectedIds.includes(category._id)}
                          onChange={() => pushMultipleCate(category._id)}
                        />
                      )}
                    </td>
                  </tr>
                ))}
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
            onClick={() => handleDelteMulti()}
            className="border bg-red-700 text-white rounded-[5px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Confirm Detete
          </button>
        </div>
      )}
    </div>
  );
}

import PropTypes from "prop-types";

AdminCategoryTable.propTypes = {
  enableMultiDel: PropTypes.bool,
};
