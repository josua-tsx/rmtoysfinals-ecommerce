import { IoIosClose } from "react-icons/io";
import { HiDownload } from "react-icons/hi";
import { useUserStore } from "../stores/useUserStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import AdminAddReasonModal from "./admin/AdminAddReasonModal";
import { useState } from "react";
import formatPrice from "../reusable/formatPrice";
import { useNavigate } from "react-router-dom";
import ReviewModal from "./ReviewModal";

export default function SingleOrderList({ order, onClose }) {
  const currentUser = useUserStore((state) => state.currentUser);

  // console.log(order);

  const [reasonModal, setReasonModal] = useState(false);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [singleProduct, setSingleProduct] = useState({});
  const [isDownloading, setIsDownloading] = useState(false);

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  // Download Invoice PDF
  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosInstance.get(`/invoice/${order._id}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${order._id.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download invoice");
    } finally {
      setIsDownloading(false);
    }
  };

  const { mutate: updatePaymentStatusMutation } = useMutation({
    mutationFn: async ({ id, paymentStatus }) => {
      const res = await axiosInstance.put(`/order/${id}/paymentStatus`, {
        paymentStatus,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      toast.success("Sucessfully Updated Status!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const handleSetProductId = (singleProduct) => {
    setSingleProduct(singleProduct);
    setOpenReviewModal(true);
  };

  const handleCloseModal = () => {
    setSingleProduct({});
    setOpenReviewModal(false);
  };

  const handleChangePaymentStatus = (id, e) => {
    const newPaymentStatus = e.target.value;

    updatePaymentStatusMutation({ id, paymentStatus: newPaymentStatus });
  };

  if (!order) return null;

  return (
    <section className="inset-0 z-50   font-main  fixed overflow-y-auto md:overflow-y-hidden backdrop-blur-sm p-3">
      {reasonModal && (
        <AdminAddReasonModal
          singleOrderData={order}
          onClose={() => setReasonModal(false)}
        />
      )}

      {openReviewModal && (
        <ReviewModal
          singleProduct={singleProduct}
          closeModal={handleCloseModal}
        />
      )}

      <div className="min-h-screen relative flex flex-col md:flex-row-reverse justify-center gap-6 md:gap-10 items-center py-10">
        <div className="border relative p-0 flex flex-col gap-0 border-black w-full md:w-[550px] bg-card rounded-[5px]  max-h-[90vh] overflow-hidden">
          {/* Header Sticker */}
          <div className="bg-primary text-white border-b border-black p-4 flex justify-between items-center relative z-10">
            <div>
              <h1 className="font-black uppercase tracking-widest text-sm">
                Order Summary
              </h1>
              <p className="font-mono text-[10px] opacity-80">#{order._id}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Download Invoice Button - Only for Delivered orders */}
              {order.status === "Delivered" && (
                <button
                  onClick={handleDownloadInvoice}
                  disabled={isDownloading}
                  type="button"
                  title="Download Invoice"
                  className="bg-green-500 text-white border border-black size-8 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <HiDownload size={16} />
                  )}
                </button>
              )}
              {/* Close Button */}
              <button
                onClick={onClose}
                type="button"
                className="bg-red-600 text-white border border-black size-8 flex items-center justify-center rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all group"
              >
                <IoIosClose
                  size={24}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col h-full overflow-y-auto p-6 gap-6">
            {/* Real-Time Order Tracking */}
            {/* <OrderTracking status={order.status} /> */}

            {/* General Info Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                  Items
                </label>
                <span className="font-black text-indigo-700">
                  {order?.orderItems?.length} Products
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                  Date Ordered
                </label>
                <span className="font-bold text-gray-600 text-xs">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {!order.guestUser && (
              <div className="grid grid-cols-2 gap-4 bg-gray-50 border border-dashed border-black rounded-[5px] p-3">
                <div className="flex flex-col gap-1">
                  <label className="font-black uppercase text-[10px] tracking-widest text-green-600">
                    Earned Points
                  </label>
                  <span className="font-black text-green-700">
                    +{order?.totalPoints}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-black uppercase text-[10px] tracking-widest text-red-500">
                    Used Credits
                  </label>
                  <span className="font-black text-red-700">
                    -{order?.usedCredits ? order?.usedCredits : 0}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                  Shipping To
                </label>
                <div className="p-3 bg-white border border-black rounded-[5px] text-xs font-bold leading-relaxed">
                  {order.shippingAddress}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                    Payment
                  </label>
                  <span className="px-3 py-1 bg-white border border-black rounded-[5px] text-[10px] font-black uppercase text-center">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                    Notes
                  </label>
                  <span
                    className={`text-[10px] font-bold italic ${
                      order.notes ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {order.notes || "No extra notes provided."}
                  </span>
                </div>
              </div>
            </div>

            {/* Refund/Fail Reason */}
            {(order?.paymentStatus === "Failed" ||
              order?.paymentStatus === "Refunded") && (
              <div className="p-3 bg-red-50 border border-red-600 rounded-[5px] flex flex-col gap-1">
                <label className="font-black uppercase text-[10px] tracking-widest text-red-700">
                  Issue Reported
                </label>
                <p className="text-sm font-bold text-red-900">
                  {order?.reason || "No reason specified."}
                </p>
              </div>
            )}

            {/* Admin Payment Override (For Non-GCash Orders) */}
            {order.paymentMethod !== "GcashQR" &&
              (currentUser?.role === "admin" ||
                currentUser?.role === "validatorStaff") && (
                <div className="p-4 bg-yellow-50 border border-yellow-500 rounded-[5px] flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-500 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-sm">
                      Admin Area
                    </span>
                    <label className="font-black uppercase text-[10px] tracking-widest text-yellow-700">
                      Override Payment Status
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <select
                      onChange={(e) => handleChangePaymentStatus(order._id, e)}
                      value={order?.paymentStatus}
                      name="paymentStatus"
                      id="paymentStatus"
                      className="flex-1 border border-yellow-500 p-2 rounded-[5px] outline-none font-black uppercase text-xs bg-white shadow-[2px_2px_0px_0px_rgba(234,179,8,1)] hover:shadow-none transition-all cursor-pointer"
                    >
                      <option value="Pending">PENDING</option>
                      <option value="Paid">PAID</option>
                      <option value="Failed">FAILED</option>
                      <option value="Refunded">REFUNDED</option>
                    </select>

                    {(order?.paymentStatus === "Failed" ||
                      order?.paymentStatus === "Refunded") && (
                      <button
                        onClick={() => setReasonModal(true)}
                        className="px-4 py-2 border border-yellow-600 bg-red-500 text-white font-black uppercase text-xs rounded-[5px] shadow-[2px_2px_0px_0px_rgba(234,179,8,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                      >
                        Reasons
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-yellow-700 italic">
                    ⚠️ Changing this will update order status logic (e.g. Failed
                    -&gt; Restock).
                  </p>
                </div>
              )}

            {/* Financials */}
            <div className="flex flex-col border border-black rounded-[5px] bg-white divide-y-2 divide-black">
              <div className="p-3 flex justify-between items-center text-xs">
                <span className="font-black uppercase tracking-widest text-gray-500">
                  Subtotal
                </span>
                <span className="font-mono font-bold text-gray-700">
                  {formatPrice(order.subtotal)} PHP
                </span>
              </div>
              <div className="p-3 flex justify-between items-center text-xs">
                <span className="font-black uppercase tracking-widest text-gray-500">
                  Shipping
                </span>
                <span className="font-mono font-bold text-gray-700">
                  {formatPrice(order.shippingPrice)} PHP
                </span>
              </div>
              <div className="p-3 bg-indigo-50 flex justify-between items-center rounded-b-[5px]">
                <div className="flex flex-col">
                  <span className="font-black uppercase text-[10px] tracking-widest text-indigo-600">
                    Total Price
                  </span>
                  <div className="flex gap-2 items-center">
                    <span
                      className={`text-[10px] font-black uppercase px-2 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                        order.status === "Cancelled"
                          ? "bg-red-400 text-white"
                          : "bg-green-400 text-white"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <span className="font-mono font-black text-2xl text-indigo-900 leading-none">
                  ₱{formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>

            {/* Product List */}
            <div className="flex flex-col gap-3">
              <label className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                Order Items
              </label>
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {order?.orderItems?.length > 0 &&
                  order?.orderItems.map((item) => (
                    <div
                      key={item?._id}
                      className="border border-black bg-white rounded-[5px] p-3 flex gap-4 items-center "
                    >
                      <div className="size-16 bg-gray-50 border border-black rounded-[5px] overflow-hidden flex-shrink-0">
                        <img
                          src={item?.productId?.productImages[0]}
                          alt="product"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-sm font-black uppercase truncate">
                            {item?.productId?.productName}
                          </h3>
                          <span className="font-mono font-bold text-xs">
                            ₱{item?.productId?.price}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                            {item?.productId?.category?.categoryName}
                          </span>
                          <span className="font-black text-xs text-indigo-600 bg-indigo-50 size-6 flex items-center justify-center rounded-full border border-indigo-200">
                            x{item?.quantity}
                          </span>
                        </div>
                        {order?.status === "Delivered" && (
                          <div className="flex gap-3 mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => {
                                navigate(`/product/${item?.productId._id}`);
                                onClose();
                              }}
                              className="text-[10px] font-black uppercase text-indigo-600 hover:underline"
                            >
                              Details
                            </button>
                            <button
                              onClick={() =>
                                handleSetProductId(item?.productId)
                              }
                              className="text-[10px] font-black uppercase text-primary hover:underline"
                            >
                              Add Review
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {order.paymentMethod === "GcashQR" && (
          <div className="border border-black flex flex-col p-0 bg-card rounded-[5px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full md:w-[400px] overflow-hidden">
            {/* Payment Proof Header */}
            <div className="bg-amber-400 text-black border-b-2 border-black p-4">
              <h2 className="font-black uppercase tracking-widest text-sm">
                Payment Proof
              </h2>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="aspect-[4/3] bg-gray-100 border border-black rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <img
                  src={order?.gcashQRmethod?.proofOfPaymentImage}
                  alt="Proof of payment"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                  onClick={() =>
                    window.open(
                      order?.gcashQRmethod?.proofOfPaymentImage,
                      "_blank"
                    )
                  }
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 p-3 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                    GCash Name
                  </span>
                  <p className="font-bold text-sm truncate">
                    {order?.gcashQRmethod?.gcashName}
                  </p>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black uppercase text-[10px] tracking-widest text-gray-400">
                    GCash Number
                  </span>
                  <p className="font-mono font-bold text-sm">
                    {order?.gcashQRmethod?.gcashPhoneNumber}
                  </p>
                </div>
              </div>

              {(currentUser?.role === "admin" ||
                currentUser?.role === "validatorStaff") && (
                <div className="flex flex-col gap-4 pt-4 border-t-2 border-black border-dashed">
                  <div className="flex flex-col gap-1">
                    <label className="font-black uppercase text-[10px] tracking-widest text-gray-400 ml-1">
                      Validate Payment
                    </label>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) =>
                          handleChangePaymentStatus(order._id, e)
                        }
                        value={order?.paymentStatus}
                        name="paymentStatus"
                        id="paymentStatus"
                        className="flex-1 border border-black p-2 rounded-[5px] outline-none font-black uppercase text-xs bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                      >
                        <option value="Pending">PENDING</option>
                        <option value="Paid">PAID</option>
                        <option value="Failed">FAILED</option>
                        <option value="Refunded">REFUNDED</option>
                      </select>

                      {(order?.paymentStatus === "Failed" ||
                        order?.paymentStatus === "Refunded") && (
                        <button
                          onClick={() => setReasonModal(true)}
                          className="px-4 py-2 border border-black bg-red-600 text-white font-black uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                          Reasons
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
