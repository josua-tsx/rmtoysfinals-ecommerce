import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";
import { ConfirmModal } from "../../reusable/ConfirmModal";

export default function AdminProductReviewsTable() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["reviews", page, debouncedSearch],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/review/get-reviews?page=${page}&limit=${limit}&search=${debouncedSearch}`,
      );
      return res.data;
    },
  });

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  const { mutate: adminDeleteReviewMutation } = useMutation({
    mutationFn: async (reviewId) => {
      const res = await axiosInstance.delete(`/review/adminDelete/${reviewId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Deleted review!");
      setOpenConfirmModal(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong.");
    },
  });

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      adminDeleteReviewMutation(selectedId);
    }
  };

  const handleNavigateToProduct = (productId) => {
    navigate(`/product/details/${productId}`);
  };

  const columns = [
    {
      header: "REVIEW ID",
      accessor: "_id",
      className: "text-left border-r border-black font-mono text-black",
      render: (item) => `#${item._id.slice(-6)}...`,
    },
    {
      header: "PRODUCT",
      accessor: "productId",
      className: "text-left border-r border-black",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-indigo-600">
            #{item?.productId.slice(-8)}
          </span>
          <button
            onClick={() => handleNavigateToProduct(item?.productId)}
            className="mt-1 text-left text-[9px] font-black uppercase hover:underline text-gray-500 hover:text-black transition-colors"
          >
            OPEN PRODUCT
          </button>
        </div>
      ),
    },
    {
      header: "USER",
      accessor: "userId",
      className: "text-left border-r border-black",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-black uppercase truncate max-w-[150px] text-black">
            {item?.userId?.username || "ANONYMOUS"}
          </span>
          <span className="text-[9px] font-black uppercase text-gray-500">
            {item?.userId?.email}
          </span>
        </div>
      ),
    },
    {
      header: "FEEDBACK",
      accessor: "commentReview",
      className: "text-left border-r border-black",
      render: (item) => (
        <div className="bg-white border border-dashed border-gray-200 p-2 rounded-[5px] hover:border-black transition-colors">
          <p className="w-[200px] md:w-[300px] lg:w-[400px] whitespace-normal line-clamp-2 italic text-gray-600 text-xs">
            {`"${item?.commentReview}"`}
          </p>
        </div>
      ),
    },
    {
      header: "RATING",
      accessor: "rating",
      className: "text-center border-r border-black",
      render: (item) => (
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`size-2 border border-black rounded-full ${
                  i < item?.rating ? "bg-amber-400" : "bg-gray-100"
                }`}
              ></div>
            ))}
          </div>
          <span className="font-mono text-xs font-black text-black">
            {item?.rating}.0
          </span>
        </div>
      ),
    },
    {
      header: "DATE",
      accessor: "createdAt",
      className: "text-center border-r border-black text-black",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      header: "ACTIONS",
      accessor: "actions",
      className: "text-center",
      render: (item) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleDeleteClick(item._id)}
            className="bg-red-50 text-red-600 border border-red-600 size-8 flex items-center justify-center rounded-[5px] shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            title="Delete Review"
          >
            <MdDelete size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (isError) return <p>Error.</p>;

  return (
    <>
      <ConfirmModal
        isOpen={openConfirmModal}
        onCancel={() => setOpenConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
      />

      <ReusableTable
        title="Product Reviews List"
        subtitle="Browse and manage all customer ratings and feedback"
        headerColor="bg-[#4f46e5]"
        columns={columns}
        data={reviews}
        isLoading={isPending}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "SEARCH BY ID, COMMENT, PRODUCT...",
        }}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: totalItems,
          onPageChange: setPage,
        }}
        emptyMessage="No product reviews found"
      />
    </>
  );
}
