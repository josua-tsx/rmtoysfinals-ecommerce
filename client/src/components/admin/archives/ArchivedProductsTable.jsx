import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { MdRestore } from "react-icons/md";
import axiosInstance from "../../../lib/axios";
import formatPrice from "../../../reusable/formatPrice";
import ReusableTable from "../../../reusable/ReusableTable";
import toast from "react-hot-toast";

export default function ArchivedProductsTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["archivedProducts", page, search],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/get-archived-products?page=${page}&limit=5&search=${search}`,
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const { mutate: restoreProduct } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/product/restore-product/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring product"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this product?")) {
      restoreProduct(id);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "productName",
      render: (item) => (
        <div className="flex items-center gap-3 font-bold">
          <img
            src={item.productImages?.[0]}
            alt=""
            className="w-10 h-10 object-cover rounded border border-black"
          />
          {item.productName}
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (item) => (
        <span className="font-mono">{formatPrice(item.price)}</span>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (item) => (
        <span className="bg-white border border-black px-2 py-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs uppercase">
          {item.category?.categoryName || "N/A"}
        </span>
      ),
    },
    {
      header: "Supplier",
      accessor: "supplier",
      render: (item) => (
        <span className="text-sm">{item.supplier?.supplierName || "N/A"}</span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      className: "text-center",
      render: (item) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleRestore(item._id)}
            className="bg-green-500 text-white p-2 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            title="Restore"
          >
            <MdRestore size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ReusableTable
      title="Archived Products"
      subtitle="Manage your archived products"
      headerColor="bg-red-500"
      columns={columns}
      data={products}
      isLoading={isPending}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search products...",
      }}
      pagination={{
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        onPageChange: setPage,
      }}
      emptyMessage="No archived products found"
    />
  );
}
