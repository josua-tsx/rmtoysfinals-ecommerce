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
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Drafts Table
        </h1>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="flex-col border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Drafts
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="search products.."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {isDraftsPending ? (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black sticky top-0 bg-[#fffdf6] z-10">
              <tr>
                <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                  ID
                </th>
                <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                  Product Name
                </th>
                <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                  Category
                </th>
                <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                  Price
                </th>
                <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                  Status
                </th>
                <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[13px]">
              {filteredArrayDrafts.length > 0 ? (
                filteredArrayDrafts.map((draft) => (
                  <tr
                    key={draft._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap font-mono font-black uppercase text-black">
                      {draft._id}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            draft.productImages.length > 0
                              ? draft.productImages[0]
                              : "fallback-image-url"
                          }
                          className="size-10 rounded-[3px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] object-cover bg-white"
                          alt={draft.productName}
                        />
                        <span className="font-black tracking-tight max-w-[200px] truncate text-black">
                          {draft.productName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {draft.category.categoryName}
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap text-center font-black text-black">
                      {draft.price} PHP
                    </td>

                    <td className="p-4 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 border border-black bg-yellow-400 rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {draft.status}
                      </span>
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap text-cener text-sm">
              {product.stocks}
            </td> */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleDeleteClick(draft._id)}
                          type="button"
                          className="border border-black p-1.5 rounded-[5px] bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          title="Delete Draft"
                        >
                          <MdDelete size={20} />
                        </button>
                        <button
                          onClick={() => publishDraftMutation(draft._id)}
                          className="border border-black py-1.5 px-3 rounded-[5px] bg-[#22c55e] text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          Send to Pending
                        </button>
                      </div>
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
