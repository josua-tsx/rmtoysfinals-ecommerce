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

export default function ArchivedCategoriesTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["archivedCategories", page, search],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/category/get-archived-categories?page=${page}&limit=5&search=${search}`,
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const categories = data?.categories || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const { mutate: restoreCategory } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/category/restore-category/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedCategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring category"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this category?")) {
      restoreCategory(id);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "categoryName",
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
      title="Archived Categories"
      subtitle="Manage your archived categories"
      headerColor="bg-red-500"
      columns={columns}
      data={categories}
      isLoading={isPending}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search categories...",
      }}
      pagination={{
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        onPageChange: setPage,
      }}
      emptyMessage="No archived categories found"
    />
  );
}
