import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminCategoryTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

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
      setSelectedIds([])
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  console.log(selectedIds);

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

  const cancelMultiDelete = () => {
    setSelectedIds([]);
  };

  const handleClickDelete = (categoryId) => {
    setSelectedId(categoryId);
    setIsOpenModal(true);
  };

  const handleConfirm = () => {
    if (setSelectedId) {
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

  const navigateToEdit = (categoryId) => {
    navigate(`/admin/editCategory/${categoryId}`);
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
            <thead>
              <tr className="">
                <th className="font-normal p-2 pb-5">ID</th>
                <th className="font-normal p-2 pb-5">Category Name</th>
                <th className="font-normal p-2 pb-5">Category Description</th>
                <th className="font-normal p-2 pb-5">
                  Category Products Count in use
                </th>
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filterdArrayCategories.length > 0 &&
                filterdArrayCategories.map((category) => (
                  <tr key={category._id}>
                    <td className="px-4 ">{category._id}</td>

                    <td className="	">{category?.categoryName}</td>

                    <td className="">{category?.categoryDescription}</td>
                    <td className="">{category?.products?.length}</td>
                    {/* <td className="">
                    {category?.products.length}
                  </td> */}

                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() => navigateToEdit(category._id)}
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

                      {enableMultiDel ? (
                        <input
                          type="checkbox"
                          id="wdwadwk"
                          checked={selectedIds.includes(category._id)}
                          onChange={() => pushMultipleCate(category._id)}
                        />
                      ) : (
                        ""
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
            className="border bg-green-700 text-white rounded-[5px] border-black p-2"
          >
            Cancel Detete
          </button>
          <button
            onClick={() => handleDelteMulti()}
            className="border bg-red-700 text-white rounded-[5px] border-black p-2"
          >
            Confirm Detete
          </button>
        </div>
      )}
    </div>
  );
}
