import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminUserTable() {
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["users", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/user/getAllCustomer?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  const { mutate: updateUserStatusMutation } = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await axiosInstance.put(`/user/update-status/${id}`, {
        status,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Successfully updated status!`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const handleStatusChange = (id, e) => {
    const newStatus = e.target.value;
    updateUserStatusMutation({ id, status: newStatus });
  };

  if (isError) {
    return <p>Error loading users</p>;
  }

  // Column Definitions
  const columns = [
    {
      header: "Customer",
      className: "text-left",
      render: (user) => (
        <div className="flex flex-col">
          <span className="truncate max-w-[200px] text-black">
            {user.email}
          </span>
          <span className="text-[11px] font-mono text-gray-400">
            ID: {user._id.slice(-6)}
          </span>
        </div>
      ),
    },
    {
      header: "Username",
      render: (user) => (
        <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {user.username}
        </span>
      ),
    },
    {
      header: "Credits",
      className: "font-mono text-black",
      accessor: "credits",
    },
    {
      header: "Phone",
      className: "text-gray-600",
      render: (user) =>
        !user.phoneNumber ? (
          <span className="text-red-500/70 italic">Pending</span>
        ) : (
          user.phoneNumber
        ),
    },
    {
      header: "Address",
      className: "text-gray-600",
      render: (user) => (
        <span className="max-w-[250px] truncate block">
          {!user?.address[0]?.fullAddress ? (
            <span className="text-red-500/70 italic">No Address Set</span>
          ) : (
            user?.address[0]?.fullAddress
          )}
        </span>
      ),
    },
    {
      header: "Status",
      render: (user) => (
        <span
          className={`px-2 py-0.5 border border-black rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status}
        </span>
      ),
    },
    {
      header: "Role",
      render: (user) => (
        <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {user.role}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (user) => (
        <div className="flex justify-center">
          <select
            value={user.status}
            onChange={(e) => handleStatusChange(user._id, e)}
            className="border border-black p-1 text-[11px] font-black uppercase outline-none rounded-[5px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer appearance-none px-4"
          >
            <option value="active">✓ Activate</option>
            <option value="blocked">✗ Block</option>
          </select>
        </div>
      ),
    },
  ];

  return (
    <ReusableTable
      title="Users Table"
      columns={columns}
      data={users}
      isLoading={isPending}
      search={{
        value: localSearchTerm,
        onChange: setLocalSearchTerm,
        placeholder: "Ex: Juan Cruz...",
      }}
      pagination={{
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        onPageChange: setPage,
      }}
      emptyMessage="no customers found"
    />
  );
}
