import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../../lib/axios";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";

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
      ticket?._id?.includes(searchTerm),
  );

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };

  if (isError) return <p>Error loading tickets</p>;

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

        <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
          {/* Green Sticker Header */}
          <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
            <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
              Tickets Table
            </h1>
          </div>

          <div className="flex-col border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
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

              <div className="flex flex-col gap-1">
                <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 ml-1">
                  Search Keywords
                </label>
                <div className="flex items-center relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ex: Account lock..."
                    className="border w-full md:w-[250px] border-black rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 font-bold"
                  />
                  <IoSearch className="absolute right-3" size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto h-[600px]">
            {isPending ? (
              <div className="p-4">
                <AdminTableSkeleton />
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-black sticky top-0 bg-[#fffdf6] z-10">
                  <tr>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                      Ticket ID
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                      Customer
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                      Email
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                      Issue Type
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-left bg-[#fffdf6]">
                      Subject
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                      Status
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                      Priority
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                      Date
                    </th>
                    <th className="font-black uppercase text-[13px] tracking-widest text-black p-4 pb-2 text-center bg-[#fffdf6]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black text-[16px]">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 whitespace-nowrap font-mono text-black">
                          #{ticket._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="p-4 whitespace-nowrap text-black">
                          {ticket.name}
                        </td>
                        <td className="p-4 whitespace-nowrap text-gray-500 italic">
                          {ticket.email}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                            {ticket.issueType}
                          </span>
                        </td>
                        <td className="p-4 text-black max-w-[200px] truncate">
                          {ticket.subject}
                        </td>
                        <td className="p-4 whitespace-nowrap text-center">
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
                        </td>
                        <td className="p-4 whitespace-nowrap text-center">
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
                        </td>
                        <td className="p-4 whitespace-nowrap text-center text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewTicket(ticket._id)}
                            type="button"
                            className="border border-black px-4 py-1 rounded-[5px] bg-[#22c55e] text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-8 text-gray-500"
                      >
                        No tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
