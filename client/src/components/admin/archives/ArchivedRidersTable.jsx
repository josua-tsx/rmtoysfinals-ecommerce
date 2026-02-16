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

export default function ArchivedRidersTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["archivedRiders", page, search],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/rider/get-archived-riders?page=${page}&limit=5&search=${search}`,
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const riders = data?.riders || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const { mutate: restoreRider } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/rider/restore-rider/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedRiders"] });
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Rider restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring rider"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this rider?")) {
      restoreRider(id);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "riderName",
      className: "font-bold",
    },
    {
      header: "Phone Number",
      accessor: "riderPhoneNumber",
      className: "font-mono",
    },
    {
      header: "Status",
      accessor: "riderStatus",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-xs border border-black uppercase font-bold ${
            item.riderStatus === "available" ? "bg-green-200" : "bg-red-200"
          }`}
        >
          {item.riderStatus}
        </span>
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
      title="Archived Riders"
      subtitle="Manage your archived riders"
      headerColor="bg-red-500"
      columns={columns}
      data={riders}
      isLoading={isPending}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search riders...",
      }}
      pagination={{
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        onPageChange: setPage,
      }}
      emptyMessage="No archived riders found"
    />
  );
}
