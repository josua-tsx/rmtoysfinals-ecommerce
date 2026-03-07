import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect, useMemo } from "react";
import axiosInstance from "../lib/axios";
import TicketModal from "../components/ticket/TicketModal";
import toast from "react-hot-toast";
import {
  IoAdd,
  IoArrowBack,
  IoSend,
  IoSearch,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoAttach,
  IoClose,
} from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { IoLockClosedOutline } from "react-icons/io5";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import app from "../firebase/firebase";
import { socket } from "../lib/socket";
import TicketListSkeleton from "../components/skeleton/TicketListSkeleton";
import useDebounce from "../hooks/useDebounce";

const STATUS_CONFIG = {
  Pending: {
    color: "text-amber-700 bg-amber-50 border-amber-700",
    icon: IoTimeOutline,
  },
  "In Progress": {
    color: "text-blue-700 bg-blue-50 border-blue-700",
    icon: IoAlertCircleOutline,
  },
  "Awaiting Confirmation": {
    color: "text-orange-700 bg-orange-50 border-orange-700",
    icon: IoTimeOutline,
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

export default function CustomerTicketsPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { ticketId } = useParams();

  const {
    data: ticketsData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userTickets", debouncedSearch],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/ticket/user?search=${debouncedSearch}`,
      );
      return res.data;
    },
    enabled: !!user,
  });

  const { mutate: sendReply, isPending: isSendingReply } = useMutation({
    mutationFn: async ({ ticketId, message, images }) => {
      const res = await axiosInstance.post(
        `/ticket/${ticketId}/customer-reply`,
        { message, images },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userTickets"] });
      setReplyMessage("");
      setSelectedImages([]);
      // Don't override selectedTicket here, let the URL logic handle it or just update it if needed for immediate UI feedback (optional)
      toast.success("Reply sent");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send reply");
    },
  });

  const { mutate: confirmResolution, isPending: isConfirming } = useMutation({
    mutationFn: async (ticketId) => {
      const res = await axiosInstance.patch(`/ticket/${ticketId}/confirm`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userTickets"] });
      toast.success(data.message || "Ticket confirmed as resolved!");
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to confirm resolution",
      );
    },
  });

  const tickets = useMemo(() => ticketsData?.tickets || [], [ticketsData]);

  // Sync selectedTicket with URL param
  useEffect(() => {
    if (ticketId && tickets.length > 0) {
      const ticketFromUrl = tickets.find((t) => t._id === ticketId);
      if (ticketFromUrl) {
        setSelectedTicket(ticketFromUrl);
      }
    } else if (!ticketId) {
      setSelectedTicket(null);
    }
  }, [ticketId, tickets]);

  // Connect socket and join customer room for real-time updates
  useEffect(() => {
    if (!user?._id) return;

    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join-customer-room", user._id);

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

  // Real-time chat update listener
  useEffect(() => {
    const handleAdminReply = () => {
      // Invalidate queries to update list and current ticket view
      queryClient.invalidateQueries({ queryKey: ["userTickets"] });
    };

    socket.on("admin-reply", handleAdminReply);

    return () => {
      socket.off("admin-reply", handleAdminReply);
    };
  }, [queryClient]);

  const handleViewTicket = (ticket) => {
    navigate(`/my-tickets/${ticket._id}`);
    setReplyMessage("");
    setSelectedImages([]);
  };

  // Image upload handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type`);
        return false;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (selectedImages.length + validFiles.length > maxFiles) {
      toast.error(`You can only attach up to ${maxFiles} images`);
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles]);
    e.target.value = ""; // Reset input
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls = [];

    try {
      const storage = getStorage(app);

      for (const file of selectedImages) {
        const fileName = `ticket-images/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Wait for upload to complete
        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedUrls.push(downloadURL);
              resolve();
            },
          );
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }

    return uploadedUrls;
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() && selectedImages.length === 0) return;

    const imageUrls = await uploadImages();
    sendReply({
      ticketId: selectedTicket._id,
      message: replyMessage || "(Image attachment)",
      images: imageUrls,
    });
  };

  // Login required gate
  if (!isUserLoading && !user)
    return (
      <div className="font-main min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-32 h-32 mx-auto bg-primary border border-black rounded-full flex items-center justify-center">
            <IoLockClosedOutline size={60} className="text-black" />
          </div>
          <h2 className="text-2xl font-black text-black">Login Required</h2>
          <p className="text-black text-base">
            <IoLockClosedOutline className="inline mr-1 mb-0.5" size={14} />
            This page requires you to be logged in. Please sign in to access
            your support tickets.
          </p>
          <Link
            to="/sign-in"
            className="inline-block bg-primary text-white border border-black px-6 py-2.5 rounded-[5px] font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Failed to load tickets.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="font-main min-h-screen pt-[120px] pb-10 px-4 md:px-8">
      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] min-h-[600px] flex flex-col md:flex-row gap-6">
        {/* Sidebar (Ticket List) */}
        <div
          className={`flex flex-col md:w-1/3 bg-card rounded-[5px] border border-black overflow-hidden ${
            selectedTicket ? "hidden md:flex" : "flex w-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-black space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  Support Tickets
                </h1>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-card border border-black p-2 rounded-[5px] hover:opacity-90 transition-all font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                title="New Ticket"
              >
                <IoAdd size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search tickets by subject or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxLength={100}
                className="w-full pl-9 pr-4 py-2 bg-gray-200 border border-black rounded-[5px] text-sm focus:bg-white outline-none transition-colors placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Ticket List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isPending ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <TicketListSkeleton key={i} />
                ))}
              </>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => {
                const StatusIcon = STATUS_CONFIG[ticket.status].icon;
                const isSelected = selectedTicket?._id === ticket._id;
                return (
                  <div
                    key={ticket._id}
                    onClick={() => handleViewTicket(ticket)}
                    className={`group p-3 rounded-[5px] cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-primary text-card border-black"
                        : "bg-white text-gray-900 border-black hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className={`font-bold text-sm line-clamp-1 ${
                          isSelected ? "text-card" : "text-gray-900"
                        }`}
                      >
                        {ticket.subject}
                      </h3>
                      <span
                        className={`text-xs ml-2 whitespace-nowrap ${
                          isSelected ? "text-card/80" : "text-gray-500"
                        }`}
                      >
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p
                      className={`text-xs line-clamp-2 mb-3 ${
                        isSelected ? "text-card/90" : "text-gray-600"
                      }`}
                    >
                      {ticket.messages?.[ticket.messages.length - 1]?.message ||
                        "No messages yet"}
                    </p>

                    <div className="flex justify-between items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[10px] font-bold border ${
                          STATUS_CONFIG[ticket.status].color
                        } ${
                          isSelected
                            ? "bg-white/90 border-transparent shadow-sm"
                            : ""
                        }`}
                      >
                        <StatusIcon size={12} />
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 px-4">
                <div className="text-gray-300 text-6xl mb-3 flex justify-center">
                  <IoAlertCircleOutline />
                </div>
                <p className="text-gray-500 text-sm">No tickets found.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-primary text-sm font-bold hover:underline"
                >
                  Create a new ticket
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content (Chat Area) */}
        <div
          className={`flex-1 flex flex-col bg-card rounded-[5px] border border-black overflow-hidden ${
            !selectedTicket ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-black flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/my-tickets")}
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900"
                  >
                    <IoArrowBack size={20} />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg text-gray-900">
                        {selectedTicket.subject}
                      </h2>
                      <span
                        className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-xs font-bold border ${
                          STATUS_CONFIG[selectedTicket.status].color
                        }`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex gap-2 font-medium">
                      <span>
                        ID: #{selectedTicket._id.slice(-6).toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>{selectedTicket.issueType}</span>
                    </p>
                  </div>
                </div>

                {selectedTicket.status !== "Closed" && (
                  <button
                    className="text-xs font-bold text-red-700 border border-red-700  px-3 py-1.5 rounded-[5px] transition-colors"
                    title="This happens automatically when resolved"
                    disabled={true}
                  >
                    Close Ticket
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50">
                <div className="flex justify-center">
                  <span className="text-xs font-medium text-gray-500 border border-gray-300 bg-white px-3 py-1 rounded-full">
                    Ticket Created:{" "}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>

                {selectedTicket.messages?.map((message, index) => {
                  const isAdmin = message.sender === "admin";
                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isAdmin ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`flex flex-col max-w-[85%] md:max-w-[70%] ${
                          isAdmin ? "items-start" : "items-end"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-xs font-bold text-gray-700">
                            {isAdmin ? "Support Agent" : "You"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>

                        <div
                          className={`px-4 py-3 rounded-[5px] text-sm leading-relaxed border border-black ${
                            isAdmin
                              ? "bg-white text-gray-900 rounded-tl-none"
                              : "bg-primary text-card rounded-tr-none"
                          }`}
                        >
                          {message.message}

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
                                    className="w-20 h-20 object-cover rounded border border-white/30 hover:opacity-80 transition-opacity"
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
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-black shrink-0">
                {selectedTicket.status === "Awaiting Confirmation" ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-orange-50 border border-orange-300 rounded-[5px] text-center">
                      <p className="text-sm font-bold text-orange-800 mb-1">
                        ✉️ The support team believes your issue has been
                        resolved.
                      </p>
                      <p className="text-xs text-orange-700 mb-3">
                        Please confirm if your issue is resolved, or reply if
                        you still need help.
                      </p>
                      <button
                        onClick={() => confirmResolution(selectedTicket._id)}
                        disabled={isConfirming}
                        className="bg-green-600 text-white border border-black px-6 py-2.5 rounded-[5px] font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50"
                      >
                        {isConfirming
                          ? "Confirming..."
                          : "✅ Yes, My Issue is Resolved"}
                      </button>
                    </div>
                    {/* Still allow replying if they need more help */}
                    <form
                      onSubmit={handleSendReply}
                      className="flex gap-2 items-end"
                    >
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply(e);
                          }
                        }}
                        placeholder="Still need help? Reply here..."
                        rows={1}
                        maxLength={1000}
                        className="flex-1 bg-gray-200 border border-black rounded-[5px] px-4 py-3 focus:bg-white transition-all resize-none max-h-32 min-h-[46px] outline-none placeholder:text-gray-500"
                        style={{ height: "auto", minHeight: "46px" }}
                      />
                      <button
                        type="submit"
                        disabled={isSendingReply || !replyMessage.trim()}
                        className="bg-primary text-card border border-black p-3 rounded-[5px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                      >
                        {isSendingReply ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <IoSend size={20} className="ml-0.5" />
                        )}
                      </button>
                    </form>
                  </div>
                ) : selectedTicket.status !== "Closed" ? (
                  <form
                    onSubmit={handleSendReply}
                    className="flex flex-col gap-2 max-w-4xl mx-auto"
                  >
                    {/* Image Preview */}
                    {selectedImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-[5px] border border-gray-300">
                        {selectedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border border-black"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <IoClose size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 items-end">
                      {/* Attachment Button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 border border-black rounded-[5px] bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Attach images (max 5)"
                      >
                        <IoAttach size={20} />
                      </button>

                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply(e);
                          }
                        }}
                        placeholder="Type your reply here..."
                        rows={1}
                        maxLength={1000}
                        className="flex-1 bg-gray-200 border border-black rounded-[5px] px-4 py-3 focus:bg-white transition-all resize-none max-h-32 min-h-[46px] outline-none placeholder:text-gray-500"
                        style={{ height: "auto", minHeight: "46px" }}
                      />
                      <button
                        type="submit"
                        disabled={
                          isSendingReply ||
                          isUploading ||
                          (!replyMessage.trim() && selectedImages.length === 0)
                        }
                        className="bg-primary text-card border border-black p-3 rounded-[5px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                      >
                        {isSendingReply || isUploading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <IoSend size={20} className="ml-0.5" />
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-100 rounded-[5px] p-4 text-center border border-black border-dashed">
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-2 font-medium">
                      <IoCloseCircleOutline size={18} />
                      This ticket is closed. You can no longer reply.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty State for Main Area */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
              <div className="w-24 h-24 bg-gray-100 border border-black rounded-full flex items-center justify-center mb-4">
                <IoSearch size={40} className="opacity-20 text-black" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Select a ticket to view
              </h3>
              <p className="text-sm font-medium">
                Choose a ticket from the list or create a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
