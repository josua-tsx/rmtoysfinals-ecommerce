import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import formatPrice from "../../reusable/formatPrice";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import useDebounce from "../../hooks/useDebounce";
import ReusableTable from "../../reusable/ReusableTable";

export default function AdminProductsTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounced Search State
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["products", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/product/get-products?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const products = data?.products || [];
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.currentPage || 1;
  const totalItems = data?.total || 0;

  // Select/Unselect logic for ReusableTable
  const handleSelect = (productId) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    const allOnPageSelected =
      products.length > 0 && products.every((p) => selectedIds.includes(p._id));

    if (allOnPageSelected) {
      // Unselect all on current page
      const newSelected = selectedIds.filter(
        (id) => !products.map((p) => p._id).includes(id),
      );
      setSelectedIds(newSelected);
    } else {
      // Select all on current page
      const currentIds = products.map((p) => p._id);
      const uniqueIds = [...new Set([...selectedIds, ...currentIds])];
      setSelectedIds(uniqueIds);
    }
  };

  const { mutate: addToSlider } = useMutation({
    mutationFn: async (productId) => {
      await axiosInstance.put(`/product/add-to-slider/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Succesfully updated!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  const { mutate: deleteProductMutation } = useMutation({
    mutationFn: async (productId) => {
      await axiosInstance.delete(`/product/delete-product/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Successfully Deleted");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  const { mutate: deleteMultiProd } = useMutation({
    mutationFn: async (ids) => {
      await axiosInstance.post(`/product/delete-multi-prod`, {
        productIds: ids,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Products deleted successfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong!");
    },
  });

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

  const handleDeleteClick = (productId) => {
    setDeleteProductId(productId);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteProductId) {
      deleteProductMutation(deleteProductId);
      setDeleteProductId(null);
      setIsConfirmModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setDeleteProductId(null);
    setIsConfirmModalOpen(false);
  };

  const cancelMultiDel = () => {
    setSelectedIds([]);
  };

  const handleMultiDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one product to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} products?`,
      )
    ) {
      deleteMultiProd(selectedIds);
    }
  };

  const navigateToeditPage = (editId) => {
    navigate(`/admin/editProduct/${editId}`);
  };

  if (isError) return <p>Error loading products</p>;

  // Column Definition
  const columns = [
    {
      header: "Product Name",
      className: "text-left",
      render: (product) => (
        <div className="flex items-center gap-3">
          <img
            src={product.productImages[0]}
            alt="Product"
            className="size-10 rounded-[5px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] object-cover bg-white"
          />
          <span className="text-[16px] tracking-tight text-black">
            {product.productName}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      render: (product) => (
        <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {product.category && product.category.categoryName}
        </span>
      ),
    },
    {
      header: "Supplier",
      render: (product) => (
        <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {product.supplier?.supplierName || "N/A"}
        </span>
      ),
    },
    {
      header: "Tax Status",
      render: (product) => (
        <span
          className={`px-2 py-0.5 border border-black rounded-[3px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            product.taxStatus === "vatable"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {product.taxStatus || "N/A"}
        </span>
      ),
    },
    {
      header: "Price",
      className: "font-mono text-black",
      render: (product) => formatPrice(product?.price),
    },
    {
      header: "Status",
      render: (product) => (
        <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {product.status}
        </span>
      ),
    },
    {
      header: "Reviews",
      accessor: "reviews",
      render: (product) => product?.reviews?.length || 0,
    },
    {
      header: "Sold",
      className: "text-green-600",
      accessor: "sold",
    },
    {
      header: "Points",
      accessor: "points",
    },
    {
      header: "Active Orders",
      render: (product) => (
        <span
          className={`px-2 py-0.5 border border-black rounded-[3px] text-[16px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            product.activeOrderCount > 0
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          {product.activeOrderCount || 0}
        </span>
      ),
    },
    {
      header: "Created",
      className: "text-gray-500 font-mono",
      render: (product) => new Date(product.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      render: (product) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigateToeditPage(product._id)}
            title="Edit"
            className="p-2 border border-black bg-yellow-400 text-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <CiEdit size={18} className="stroke-[1px]" />
          </button>
          <button
            onClick={() => handleDeleteClick(product._id)}
            title="Delete"
            className="p-2 border border-black bg-red-500 text-white rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <MdDelete size={18} />
          </button>
          <button
            onClick={() => addToSlider(product._id)}
            className={`px-3 py-1.5 border border-black rounded-[5px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
              !product?.isBestProduct
                ? "bg-blue-500 text-white"
                : "bg-white text-black"
            }`}
          >
            {!product?.isBestProduct ? "Add Slider" : "Rem Slider"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ReusableTable
        title="Products Table"
        columns={columns}
        data={products}
        isLoading={isPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "Ex: Toy car...",
        }}
        pagination={{
          currentPage: page,
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
      />

      {/* Multi Delete Floating Action */}
      {selectedIds && selectedIds.length > 0 && (
        <div className="w-full flex gap-3 justify-end p-4 border border-t-0 border-black bg-gray-50 rounded-b-[5px] mt-[-6px] relative z-10">
          <button
            onClick={cancelMultiDel}
            className="px-6 py-2 border border-black bg-white font-black text-[16px] uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleMultiDelete}
            className="px-6 py-2 border border-black bg-red-600 text-white font-black text-[16px] uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}
    </>
  );
}
