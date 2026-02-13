import { useState } from "react";
import axiosInstance from "../lib/axios";
import SingleOrderList from "./SingleOrderList";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../reusable/LoadingSpinner.jsx";
import { generateInvoicePDF } from "../lib/generateReport";
import toast from "react-hot-toast";
import Pagination from "../reusable/Pagination";

export default function UserDeliveredOrder() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [page, setPage] = useState(1);

  const {
    data: deliveredData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userDelivered", page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-userDelivered`, {
        params: { page, limit: 5 },
      });
      return res.data;
    },
  });

  const userDelivered = deliveredData?.orders || [];
  const totalPages = deliveredData?.totalPages || 0;
  const totalItems = deliveredData?.total || 0;

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const handleDownloadInvoice = async (e, orderId) => {
    e.stopPropagation();
    try {
      setDownloadingId(orderId);
      const res = await axiosInstance.get(`/invoice/${orderId}`);
      const invoiceData = res.data;

      generateInvoicePDF(invoiceData);
      toast.success("Invoice downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  if (isError) return <p>Shown error here...</p>;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* MODAL */}
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      {isPending ? (
        <div className="w-full flex justify-center items-center h-[300px]">
          <LoadingSpinner />
        </div>
      ) : userDelivered && userDelivered.length > 0 ? (
        <div className="grid gap-4">
          {userDelivered.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-black rounded-[5px] p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                {/* Product Info */}
                <div className="flex gap-4 items-center flex-1">
                  <div className="w-20 h-20 bg-gray-100 border border-black rounded-[5px] flex items-center justify-center p-2 shrink-0">
                    <img
                      src={order?.imageUrl || "/placeholder.png"}
                      alt="Product"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg">
                        {order?.orderItems?.length} ITEM
                        {order?.orderItems?.length > 1 ? "S" : ""}
                      </span>
                      <span className="bg-green-100 text-green-700 border border-green-600 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full">
                        Delivered
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">
                      ORDER ID: {order._id}
                    </p>
                    <p className="text-xs text-black font-bold">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={(e) => handleDownloadInvoice(e, order._id)}
                    disabled={downloadingId === order._id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 border border-black rounded-[5px] font-bold text-xs uppercase hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingId === order._id ? (
                      <div className="animate-spin h-3 w-3 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <span>📄</span> Invoice
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenSingleOrder(order)}
                    className="px-6 py-2 bg-black text-white border border-transparent rounded-[5px] font-bold text-xs uppercase hover:bg-gray-800 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-300 rounded-[5px] bg-gray-50 text-gray-400">
          <p className="font-bold text-lg">No delivered orders yet</p>
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          isLoading={isPending}
        />
      )}
    </div>
  );
}
