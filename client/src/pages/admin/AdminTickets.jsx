import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../../lib/axios";
import { IoSearch } from "react-icons/io5";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  Pending: "text-yellow-600 bg-yellow-100",
  "In Progress": "text-blue-600 bg-blue-100",
  Resolved: "text-green-600 bg-green-100",
  Closed: "text-gray-600 bg-gray-100",
};

const PRIORITY_COLORS = {
  Low: "text-green-600",
  Medium: "text-yellow-600",
  High: "text-red-600",
};

export default function AdminTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const navigate = useNavigate();

  const {
    data: ticketsData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["tickets", statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      params.append("limit", "100");

      const res = await axiosInstance.get(`/ticket?${params.toString()}`);
      return res.data;
    },
  });

  const tickets = ticketsData?.tickets || [];

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket?._id?.includes(searchTerm)
  );

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };

  if (isError) return <p>Error loading tickets</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative">
      <div className="border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 gap-4">
        <h1 className="font-bold text-lg">SUPPORT TICKETS</h1>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-black rounded-[5px] p-1 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-black rounded-[5px] p-1 focus:outline-none"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Search */}
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tickets..."
              className="border w-[130px] md:w-[250px] border-black rounded-[5px] p-1 pr-8 focus:outline-none"
            />
            <IoSearch className="absolute right-2" size={20} />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[600px] py-3">
        {isPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="font-normal p-2 pb-5">TICKET ID</th>
                <th className="font-normal p-2 pb-5">CUSTOMER</th>
                <th className="font-normal p-2 pb-5">EMAIL</th>
                <th className="font-normal p-2 pb-5">ISSUE TYPE</th>
                <th className="font-normal p-2 pb-5">SUBJECT</th>
                <th className="font-normal p-2 pb-5">STATUS</th>
                <th className="font-normal p-2 pb-5">PRIORITY</th>
                <th className="font-normal p-2 pb-5">DATE</th>
                <th className="font-normal p-2 pb-5">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-xs text-center">
                      {ticket._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-center">
                      {ticket.name}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-center">
                      {ticket.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                      {ticket.issueType}
                    </td>
                    <td className="px-4 py-4 text-sm text-center max-w-[200px] truncate">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          STATUS_COLORS[ticket.status] || "text-gray-600"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`font-medium text-sm ${
                          PRIORITY_COLORS[ticket.priority] || "text-gray-600"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap text-center text-sm">
                      <button
                        onClick={() => handleViewTicket(ticket._id)}
                        type="button"
                        className="text-indigo-700 hover:underline"
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
