import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { MdRestore } from "react-icons/md";
import axiosInstance from "../../../lib/axios";
import ReusableTable from "../../../reusable/ReusableTable";
import toast from "react-hot-toast";

export default function ArchivedSuppliersTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["archivedSuppliers", page, search],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/supplier/get-archived-suppliers?page=${page}&limit=5&search=${search}`,
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const suppliers = data?.suppliers || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const { mutate: restoreSupplier } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/supplier/restore-supplier/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedSuppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring supplier"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this supplier?")) {
      restoreSupplier(id);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "supplierName",
      className: "font-bold",
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
      title="Archived Suppliers"
      subtitle="Manage your archived suppliers"
      headerColor="bg-red-500"
      columns={columns}
      data={suppliers}
      isLoading={isPending}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search suppliers...",
      }}
      pagination={{
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        onPageChange: setPage,
      }}
      emptyMessage="No archived suppliers found"
    />
  );
}
