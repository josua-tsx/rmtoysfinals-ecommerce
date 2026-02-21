import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";
import { useUserStore } from "../../stores/useUserStore";

export default function AdminTickets() {
  const navigate = useNavigate();

  const currentUser = useUserStore((state) => state.currentUser);
  const basePath =
    currentUser?.role === "validatorStaff" ? "/validator" : "/admin";

  // State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter, priorityFilter]);

  const { data, isPending, isError } = useQuery({
    queryKey: [
      "tickets",
      page,
      limit,
      statusFilter,
      priorityFilter,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const res = await axiosInstance.get(`/ticket?${params.toString()}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const tickets = data?.tickets || [];
  const totalPages = data?.pagination?.totalPages || 0;
  const totalItems = data?.pagination?.totalTickets || 0;
  const currentPage = data?.pagination?.currentPage || 1;

  const handleViewTicket = (ticketId) => {
    navigate(`${basePath}/ticket/${ticketId}`);
  };

  if (isError) return <p>Error loading tickets</p>;

  // Columns definition
  const columns = [
    {
      header: "Ticket ID",
      className: "font-mono text-black text-left",
      render: (ticket) => `#${ticket._id.slice(-8).toUpperCase()}`,
    },
    {
      header: "Customer",
      className: "text-left text-black",
      accessor: "name",
    },
    {
      header: "Email",
      className: "text-left text-gray-500 italic",
      accessor: "email",
    },
    {
      header: "Issue Type",
      className: "text-left",
      render: (ticket) => (
        <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {ticket.issueType}
        </span>
      ),
    },
    {
      header: "Subject",
      className: "text-left text-black max-w-[200px] truncate",
      accessor: "subject",
    },
    {
      header: "Status",
      render: (ticket) => (
        <span
          className={`px-2 py-0.5 border border-black rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black ${
            ticket.status === "Pending"
              ? "bg-yellow-400"
              : ticket.status === "In Progress"
                ? "bg-blue-400"
                : ticket.status === "Resolved"
                  ? "bg-green-400"
                  : "bg-gray-400"
          }`}
        >
          {ticket.status}
        </span>
      ),
    },
    {
      header: "Priority",
      render: (ticket) => (
        <span
          className={`uppercase ${
            ticket.priority === "High"
              ? "text-red-600 font-bold"
              : ticket.priority === "Medium"
                ? "text-yellow-600 font-bold"
                : "text-green-600 font-bold"
          }`}
        >
          {ticket.priority}
        </span>
      ),
    },
    {
      header: "Date",
      className: "text-gray-500 text-center",
      render: (ticket) => new Date(ticket.createdAt).toLocaleDateString(),
    },
    {
      header: "Action",
      render: (ticket) => (
        <button
          onClick={() => handleViewTicket(ticket._id)}
          type="button"
          className="border border-black px-4 py-1 rounded-[5px] bg-[#22c55e] text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          View
        </button>
      ),
    },
  ];

  const FilterActions = (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex flex-col gap-1">
        <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 ml-1">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-black rounded-[5px] p-2 focus:outline-none bg-gray-50 font-bold"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 ml-1">
          Priority
        </label>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="border border-black rounded-[5px] p-2 focus:outline-none bg-gray-50 font-bold"
        >
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    </div>
  );

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Filter and manage support requests from customers.
            </p>
          </div>
        </div>

        <ReusableTable
          title="Tickets Table"
          columns={columns}
          data={tickets}
          isLoading={isPending}
          search={{
            value: localSearchTerm,
            onChange: setLocalSearchTerm,
            placeholder: "Ex: Account lock...",
          }}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            onPageChange: setPage,
          }}
          actions={FilterActions}
          emptyMessage="No tickets found"
        />
      </div>
    </section>
  );
}
