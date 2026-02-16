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

export default function ArchivedWorkersTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["archivedWorkers", page, search],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/user/get-archived-workers?page=${page}&limit=5&search=${search}`,
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const workers = data?.workers || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const { mutate: restoreWorker } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/user/restore-worker/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedWorkers"] });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring worker"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this worker?")) {
      restoreWorker(id);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold">{item.fullName || item.username}</span>
          <span className="text-xs text-gray-500 font-normal">
            {item.email}
          </span>
          <span className="text-xs text-indigo-500 font-black uppercase">
            {item.role}
          </span>
        </div>
      ),
    },
    {
      header: "Phone Number",
      accessor: "phoneNumber",
      render: (item) => (
        <span className="font-mono">{item.phoneNumber || "N/A"}</span>
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
      title="Archived Workers"
      subtitle="Manage your archived workers"
      headerColor="bg-red-500"
      columns={columns}
      data={workers}
      isLoading={isPending}
      search={{
        value: search,
        onChange: setSearch,
        placeholder: "Search workers...",
      }}
      pagination={{
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        onPageChange: setPage,
      }}
      emptyMessage="No archived workers found"
    />
  );
}
