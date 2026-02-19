import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import formatPrice from "../../reusable/formatPrice";
import { FaCreditCard, FaWallet, FaTimes } from "react-icons/fa";
import { useState } from "react";
import AdminPaymentValidationSkeleton from "../../components/skeleton/AdminPaymentValidationSkeleton";

export default function AdminPaymentValidation() {
  const queryClient = useQueryClient();

  // Modal state
  const [rejectModal, setRejectModal] = useState({ open: false, order: null });
  const [rejectReason, setRejectReason] = useState("");

  // Fetch orders needing payment validation (GcashQR or Online Payment with Pending status)
  const {
    data: pendingOrders = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["pendingPayments"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-pending-payments`);
      return res.data;
    },
  });

  const { mutate: updatePaymentStatusMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: async ({ id, paymentStatus, reason }) => {
        const res = await axiosInstance.put(`/order/${id}/paymentStatus`, {
          paymentStatus,
          reason,
        });
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pendingPayments"] });
        queryClient.invalidateQueries({ queryKey: ["order"] });
        toast.success("Payment Status Updated!");
        closeRejectModal();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Action failed");
      },
    });

  const handleApprove = (id) => {
    if (confirm("Are you sure you want to APPROVE this payment?")) {
      updatePaymentStatusMutation({ id, paymentStatus: "Paid" });
    }
  };

  const openRejectModal = (order) => {
    setRejectModal({ open: true, order });
    setRejectReason("");
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, order: null });
    setRejectReason("");
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    updatePaymentStatusMutation({
      id: rejectModal.order._id,
      paymentStatus: "Failed",
      reason: rejectReason.trim(),
    });
  };

  if (isPending) return <AdminPaymentValidationSkeleton />;
  if (isError)
    return (
      <p className="text-red-500 font-bold">
        Error loading pending validations.
      </p>
    );

  return (
    <div className="pt-6">
      {/* Rejection Reason Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeRejectModal}
          />
          <div className="relative bg-card border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-500 text-white p-4 border-b-2 border-black flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest">
                Reject Payment
              </h3>
              <button
                onClick={closeRejectModal}
                className="bg-white text-red-500 border border-black size-8 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-700">
                  <span className="font-bold">Order:</span> #
                  {rejectModal.order?._id.slice(-6)}
                </p>
                <p className="text-sm text-red-700">
                  <span className="font-bold">Amount:</span> ₱
                  {formatPrice(rejectModal.order?.totalPrice)}
                </p>
              </div>

              <div>
                <label className="block font-black uppercase text-xs tracking-widest text-gray-600 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason why this payment is being rejected..."
                  rows={4}
                  maxLength={1000}
                  className="w-full p-3 border-2 border-black rounded-lg outline-none focus:ring-2 focus:ring-red-300 resize-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                />
                <p className="text-xs text-gray-500 mt-1 italic">
                  This reason will be visible to the customer.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-2 border-black bg-gray-50 flex gap-3">
              <button
                onClick={closeRejectModal}
                disabled={isUpdating}
                className="flex-1 py-3 px-4 rounded-lg font-black uppercase text-sm border-2 border-black bg-white text-gray-700 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isUpdating || !rejectReason.trim()}
                className="flex-1 py-3 px-4 rounded-lg font-black uppercase text-sm border-2 border-black bg-red-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-black uppercase text-xl tracking-widest text-gray-800">
          Pending Validations ({pendingOrders.length})
        </h2>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-gray-500 font-bold uppercase tracking-widest">
            No pending payments to validate.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Orders paid via GCash QR or Online Payment will appear here for
            review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div
                className={`p-3 border-b-2 border-black flex justify-between items-center ${
                  order.paymentMethod === "GcashQR"
                    ? "bg-blue-400"
                    : "bg-purple-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  {order.paymentMethod === "GcashQR" ? (
                    <FaWallet className="text-white" />
                  ) : (
                    <FaCreditCard className="text-white" />
                  )}
                  <span className="font-black text-white text-xs uppercase">
                    {order.paymentMethod === "GcashQR" ? "GCash" : "Online"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black font-mono text-sm text-white">
                    #{order._id.slice(-6)}
                  </span>
                  <span className="text-xs font-bold uppercase bg-white border border-black px-2 py-0.5 rounded-full">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Receipt Image (GCash) or Confirmation (Stripe) */}
              <div className="relative aspect-video bg-gray-100 border-b-2 border-black group overflow-hidden">
                {order.paymentMethod === "GcashQR" ? (
                  order.gcashQRmethod?.proofOfPaymentImage ? (
                    <img
                      src={order.gcashQRmethod.proofOfPaymentImage}
                      alt="Receipt"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                      onClick={() =>
                        window.open(
                          order.gcashQRmethod.proofOfPaymentImage,
                          "_blank",
                        )
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-bold uppercase text-xs">
                      No Receipt Uploaded
                    </div>
                  )
                ) : (
                  // Online Payment - Show Stripe confirmation style
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
                    <FaCreditCard className="text-4xl text-purple-400 mb-2" />
                    <p className="font-bold text-purple-700 text-sm uppercase tracking-wide">
                      Online Payment
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Verify in Stripe Dashboard if needed
                    </p>
                  </div>
                )}
                {order.paymentMethod === "GcashQR" &&
                  order.gcashQRmethod?.proofOfPaymentImage && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white font-black uppercase tracking-widest text-sm bg-black/50 px-3 py-1 rounded border border-white">
                        Click to Zoom
                      </span>
                    </div>
                  )}
              </div>

              {/* Details */}
              <div className="p-4 flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Customer
                    </p>
                    <p className="font-bold text-sm leading-tight">
                      {order.userId?.fullName || "Guest"}
                    </p>
                    {order.paymentMethod === "GcashQR" && (
                      <p className="font-mono text-xs text-gray-500">
                        {order.gcashQRmethod?.gcashPhoneNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase">
                      Amount
                    </p>
                    <p className="font-black text-xl text-primary">
                      ₱{formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-2 rounded text-xs text-gray-600 line-clamp-2">
                  <span className="font-bold">Items:</span>{" "}
                  {order.orderItems
                    ?.map(
                      (i) => i.productId?.productName || i.name || "Product",
                    )
                    .join(", ")}
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 border-t-2 border-black grid grid-cols-2 gap-3 bg-gray-50">
                <button
                  onClick={() => openRejectModal(order)}
                  className="py-2 px-4 rounded font-black uppercase text-xs border border-black bg-white text-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(order._id)}
                  className="py-2 px-4 rounded font-black uppercase text-xs border border-black bg-green-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
