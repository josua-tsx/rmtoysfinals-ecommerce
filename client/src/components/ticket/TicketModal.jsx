import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";
import {
  HiOutlineCurrencyDollar,
  HiOutlineTruck,
  HiOutlineQuestionMarkCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineChatBubbleLeftEllipsis,
} from "react-icons/hi2";
import { useUserStore } from "../../stores/useUserStore";
import PropTypes from "prop-types";

const ISSUE_TYPES = [
  {
    value: "Refund Request",
    label: "Refund Request",
    icon: HiOutlineCurrencyDollar,
  },
  { value: "Shipping Issue", label: "Shipping Issue", icon: HiOutlineTruck },
  {
    value: "Product Inquiry",
    label: "Product Inquiry",
    icon: HiOutlineQuestionMarkCircle,
  },
  {
    value: "Damaged Product",
    label: "Damaged Product",
    icon: HiOutlineExclamationTriangle,
  },
  {
    value: "Order Cancellation",
    label: "Order Cancellation",
    icon: HiOutlineXCircle,
  },
  { value: "Other", label: "Other", icon: HiOutlineChatBubbleLeftEllipsis },
];

export default function TicketModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.currentUser);

  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    orderNumber: "",
    issueType: "",
    subject: "",
    message: "",
    priority: "Medium",
  });

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/ticket/create", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(
        "Ticket submitted successfully! We'll respond to your email shortly."
      );
      onClose();
      setFormData({
        name: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        orderNumber: "",
        issueType: "",
        subject: "",
        message: "",
        priority: "Medium",
      });

      queryClient.invalidateQueries({
        queryKey: ["userTickets"],
      });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ||
          "Failed to submit ticket. Please try again."
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.issueType) {
      toast.error("Please select an issue type");
      return;
    }

    if (!formData.subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    createTicket(formData);
  };

  if (!isOpen) return null;

  return (
    <section className="inset-0 z-50 fixed overflow-y-auto backdrop-blur-sm p-3">
      <div className="min-h-screen relative flex flex-col justify-center items-center py-10">
        <div className="border border-black w-full max-w-[600px] relative bg-card rounded-[5px]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute border border-black text-card bg-primary rounded-[5px] px-5 right-0 -top-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <IoIosClose size={25} />
          </button>

          <div className="p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 text-center">
              Submit a Support Ticket
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Have an issue? Let us know and we&apos;ll get back to you as soon
              as possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Issue Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ISSUE_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            issueType: type.value,
                          }))
                        }
                        className={`p-3 border border-black hover:bg-primary/50 bg-primary rounded-[5px] text-sm flex flex-col items-center gap-1 transition-all ${
                          formData.issueType === type.value
                            ? " text-card bg-primary/50 "
                            : ""
                        }`}
                      >
                        <Icon className="text-xl text-black" />
                        <span className="text-black">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Phone & Order Number Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary"
                    placeholder="09xxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Order Number (if applicable)
                  </label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary"
                    placeholder="Order ID"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary resize-none"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              {/* Priority (optional) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border border-black rounded-[5px] p-2 focus:outline-none focus:border-primary"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary border border-black text-card py-3 rounded-[5px] font-medium hover:opacity-90 disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                {isPending ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

TicketModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
