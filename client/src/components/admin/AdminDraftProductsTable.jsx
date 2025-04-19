import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminDraftProductsTable() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const {
    data: drafts = [],
    isPending: isDraftsPending,
    isError: isDraftsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-drafts`);
      return res.data;
    },
  });

  const arrayDrafts = Array.isArray(drafts) ? drafts : [];

  const filteredArrayDrafts = arrayDrafts.filter(
    (draft) =>
      draft.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      draft._id.includes(searchTerm) ||
      draft.category.categoryName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const { mutate: deleteDraftMutation } = useMutation({
    mutationFn: async (draftId) => {
      const res = await axiosInstance.delete(
        `/product/delete-draft/${draftId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Draft deleted");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleDeleteClick = (productId) => {
    setDeleteProductId(productId);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteProductId) {
      deleteDraftMutation(deleteProductId);
      cancelDelete();
    }
  };

  const cancelDelete = () => {
    setDeleteProductId(null);
    setIsConfirmModalOpen(false);
  };

  const { mutate: publishDraftMutation } = useMutation({
    mutationFn: async (draftId) => {
      const res = await axiosInstance.post(`/product/publish-draft/${draftId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Draft published successfully!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  if (isDraftsError) {
    return <p>error...</p>;
  }

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>DRAFTS TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search products.."
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isDraftsPending ? (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr className="">
                <th className="font-normal p-2 pb-5">ID</th>
                <th className="font-normal p-2 pb-5">PRODUCT NAME</th>
                <th className="font-normal p-2 pb-5">CATEGORY</th>
                <th className="font-normal p-2 pb-5">PRICE</th>
                <th className="font-normal p-2 pb-5">STATUS</th>
                {/* <th className="font-normal p-2 pb-5">Stocks</th> */}
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filteredArrayDrafts.length > 0 ? (
                filteredArrayDrafts.map((draft) => (
                  <tr key={draft._id}>
                    <td className="px-4 ">{draft._id}</td>
                    <td className="px-2 uppercase py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                      <img
                        src={
                          draft.productImages.length > 0 &&
                          draft.productImages[0]
                        }
                        alt="Product img"
                        className="size-10 rounded-full"
                      />
                      {draft.productName}
                    </td>

                    <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {draft.category.categoryName}
                    </td>

                    <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {draft.price} PHP
                    </td>

                    <td className="px-6 uppercase py-4 whitespace-nowrap text-center text-sm">
                      {draft.status}
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap text-cener text-sm">
              {product.stocks}
            </td> */}
                    <td className=" whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() => handleDeleteClick(draft._id)}
                        type="button"
                        className="text-red-600 hover:text-red-300"
                      >
                        <MdDelete size={25} />
                      </button>
                      <button
                        onClick={() => publishDraftMutation(draft._id)}
                        className="text-green-600 hover:text-indigo-300 mr-2"
                      >
                        SEND TO PENDING STOCKS
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <p>No draft</p>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
