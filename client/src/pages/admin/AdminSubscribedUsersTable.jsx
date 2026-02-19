import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminSubscribedUsersTable() {
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
    queryKey: ["subscribedUsers", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/subscribe/get-all-subscribed-users?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  if (isError) {
    return <p>Error loading subscribed users</p>;
  }

  // Column Definitions
  const columns = [
    {
      header: "User",
      className: "text-left",
      render: (user) => (
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-8 h-8 rounded-full border border-black object-cover"
          />
          <div className="flex flex-col">
            <span className="truncate max-w-[200px] text-black font-bold">
              {user.fullName || user.username}
            </span>
            <span className="text-[11px] font-mono text-gray-400">
              ID: {user._id.slice(-6)}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      className: "text-gray-600",
      render: (user) => (
        <span className="truncate max-w-[250px] block">{user.email}</span>
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
      header: "Status",
      render: () => (
        <span className="px-2 py-0.5 border border-black bg-green-100 text-green-800 rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Subscribed
        </span>
      ),
    },
  ];

  return (
    <ReusableTable
      title="Subscribed Users"
      columns={columns}
      data={users}
      isLoading={isPending}
      search={{
        value: localSearchTerm,
        onChange: setLocalSearchTerm,
        placeholder: "Search by name, email...",
      }}
      pagination={{
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        onPageChange: setPage,
      }}
      emptyMessage="No subscribed users found"
    />
  );
}
