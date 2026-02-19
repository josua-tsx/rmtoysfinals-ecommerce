import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import {
  IoArrowBack,
  IoPersonOutline,
  IoMailOutline,
  IoCallOutline,
  IoReceiptOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoSend,
} from "react-icons/io5";
import { SiGooglegemini } from "react-icons/si";
import Buttons from "../../reusable/Buttons";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { socket } from "../../lib/socket";

const STATUS_CONFIG = {
  Pending: {
    color: "text-amber-700 bg-amber-50 border-amber-700",
    icon: IoTimeOutline,
  },
  "In Progress": {
    color: "text-blue-700 bg-blue-100 border-blue-700",
    icon: IoAlertCircleOutline,
  },
  Resolved: {
    color: "text-green-700 bg-green-50 border-green-700",
    icon: IoCheckmarkCircleOutline,
  },
  Closed: {
    color: "text-gray-700 bg-gray-50 border-gray-700",
    icon: IoCloseCircleOutline,
  },
};

export default function AdminTicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef(null);

  const {
    data: ticketData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/ticket/${ticketId}`);
      return res.data;
    },
    enabled: !!ticketId,
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(`/ticket/${ticketId}/status`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Status updated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  const { mutate: sendReply, isPending: isSendingReply } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/ticket/${ticketId}/reply`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      setReplyMessage("");
      toast.success("Reply sent successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send reply");
    },
  });

  // AI Suggestion Mutation
  const { mutate: suggestReply, isPending: isGeneratingSuggestion } =
    useMutation({
      mutationFn: async () => {
        const res = await axiosInstance.post("/gemini/generate-ticket-reply", {
          ticketId: ticket._id,
          subject: ticket.subject,
          issueType: ticket.issueType,
          customerName: ticket.name,
          messages: ticket.messages,
        });
        return res.data;
      },
      onSuccess: (data) => {
        if (data.suggestedReply) {
          setReplyMessage(data.suggestedReply);
          toast.success(
            "AI suggestion generated! Feel free to edit before sending.",
          );
        }
      },
      onError: (err) => {
        const message =
          err.response?.data?.message || "Failed to generate suggestion";
        toast.error(message);
      },
    });

  const ticket = ticketData?.ticket;

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  // Real-time chat update listener (Admin)
  useEffect(() => {
    if (!ticket) return;

    // Connect socket if not connected (AdminLayout usually handles this, but safety first)
    if (!socket.connected) {
      socket.connect();
      socket.emit("join-admin-room");
    }

    const handleCustomerReply = (data) => {
      if (data.ticketId === ticket._id) {
        queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      }
    };

    socket.on("new-ticket-reply", handleCustomerReply);

    return () => {
      socket.off("new-ticket-reply", handleCustomerReply);
    };
  }, [ticket, ticketId, queryClient]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    sendReply({ message: replyMessage });
  };

  const handleStatusChange = (e) => {
    updateStatus({ status: e.target.value });
  };

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 font-medium">Error loading ticket</p>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[ticket.status].icon;

  return (
    <div className="font-main min-h-screen pt-14 pb-10 px-4 md:px-8 ">
      {/* Header / Back Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => navigate("/admin/tickets")}
          className="inline-flex items-center gap-2 font-medium transition-colors"
        >
          <IoArrowBack size={20} />
          Back to Tickets
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Chat Interface */}
        <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)] border border-black rounded-[5px] bg-card overflow-hidden shadow-sm">
          {/* Chat Header */}
          <div className="p-4 border-b border-black bg-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-lg text-gray-900 leading-tight">
                  {ticket.subject}
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>Ticket ID: {ticket._id}</span>
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
            <div className="flex justify-center">
              <span className="text-xs font-medium text-gray-500 border border-gray-200 bg-white px-3 py-1 rounded-full shadow-sm">
                Ticket Created: {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>

            {ticket.messages?.map((message, index) => {
              const isAdmin = message.sender === "admin";
              return (
                <div
                  key={index}
                  className={`flex ${
                    isAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
                      isAdmin ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-gray-700">
                        {isAdmin ? "You (Support)" : ticket.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div
                      className={`px-4 py-3 rounded-[5px] text-sm leading-relaxed border border-black shadow-sm ${
                        isAdmin
                          ? "bg-primary text-card rounded-tr-none"
                          : "bg-white text-gray-900 rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.message}</p>

                      {/* Display Images */}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.images.map((img, imgIdx) => (
                            <a
                              key={imgIdx}
                              href={img}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={img}
                                alt={`Attachment ${imgIdx + 1}`}
                                className={`w-20 h-20 object-cover rounded border hover:opacity-80 transition-opacity ${
                                  isAdmin
                                    ? "border-white/30"
                                    : "border-gray-300"
                                }`}
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form */}
          <div className="p-4 bg-white border-t border-black shrink-0">
            {ticket.status !== "Closed" ? (
              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(e);
                    }
                  }}
                  placeholder="Type your reply..."
                  className="w-full bg-gray-100 border border-black rounded-[5px] px-4 py-3 focus:bg-white transition-all resize-none min-h-[80px] max-h-40 outline-none placeholder:text-gray-500 focus:shadow-inner"
                  maxLength={1000}
                />
                <div className="flex gap-3 items-center justify-between">
                  {/* AI Suggest Button */}
                  <button
                    type="button"
                    onClick={() => suggestReply()}
                    disabled={isGeneratingSuggestion}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-black rounded-[5px] hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:translate-y-0.5 active:shadow-none font-medium text-sm"
                  >
                    {isGeneratingSuggestion ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SiGooglegemini size={16} />
                        <span>Suggest Reply</span>
                      </>
                    )}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isSendingReply || !replyMessage.trim()}
                    className="flex items-center gap-2 bg-primary text-card border border-black px-5 py-2.5 rounded-[5px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:translate-y-0.5 active:shadow-none font-medium text-sm"
                  >
                    {isSendingReply ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <IoSend size={16} />
                        <span>Send Reply</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-100 rounded-[5px] p-4 text-center border border-black border-dashed">
                <p className="text-gray-500 text-sm flex items-center justify-center gap-2 font-medium">
                  <IoCloseCircleOutline size={18} />
                  This ticket is closed. Reopen it to send a reply.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="border border-black rounded-[5px] bg-white overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-black px-4 py-3">
              <h3 className="font-bold text-gray-900">Customer Information</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                  <IoPersonOutline size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Name
                  </p>
                  <p className="font-bold text-gray-900">{ticket.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                  <IoMailOutline size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="font-bold text-gray-900 break-all">
                    {ticket.email}
                  </p>
                </div>
              </div>

              {ticket.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <IoCallOutline size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="font-bold text-gray-900">{ticket.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details Card */}
          <div className="border border-black rounded-[5px] bg-white overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-black px-4 py-3">
              <h3 className="font-bold text-gray-900">Ticket Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                  <IoAlertCircleOutline size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Issue Type
                  </p>
                  <p className="font-bold text-gray-900">{ticket.issueType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                  <IoTimeOutline size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Timeline
                  </p>
                  <p className="text-xs text-gray-900 mt-1">
                    <span className="text-gray-500">Created:</span> <br />
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-900 mt-2">
                    <span className="text-gray-500">Last Updated:</span> <br />
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {ticket.orderNumber && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                    <IoReceiptOutline size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      Order Number
                    </p>
                    <p className="font-bold text-indigo-700 ">
                      {ticket.orderNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status & Actions Card */}
          <div className="border border-black rounded-[5px] bg-white overflow-hidden shadow-sm">
            <div className="bg-gray-50 border-b border-black px-4 py-3">
              <h3 className="font-bold text-gray-900">Update Status</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="p-3 bg-gray-50 rounded-[5px] border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    Current Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-xs font-bold border ${
                      STATUS_CONFIG[ticket.status].color
                    }`}
                  >
                    <StatusIcon size={12} />
                    {ticket.status}
                  </span>
                </div>
                <select
                  value={ticket.status}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                  className="w-full bg-white border border-black rounded-[5px] p-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="pt-2 space-y-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Quick Actions
                </h4>
                <Buttons
                  onClick={() => updateStatus({ status: "Resolved" })}
                  disabled={isUpdatingStatus || ticket.status === "Resolved"}
                  buttonName="Mark as Resolved"
                  icon={<FaCheckCircle size={18} />}
                  animateIcon={true}
                  className="w-full bg-green-600 !text-white  py-2.5"
                />
                <Buttons
                  onClick={() => updateStatus({ status: "Closed" })}
                  disabled={isUpdatingStatus || ticket.status === "Closed"}
                  buttonName="Close Ticket"
                  icon={<FaTimesCircle size={18} />}
                  animateIcon={true}
                  className="w-full bg-gray-700 !text-white  py-2.5"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
