import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminSuccesfullTransactions from "./AdminSuccesfullTransactions";
import AdminFailedTransactions from "./AdminFailedTransactions";
import AdminRefundedCancelledTransactions from "./AdminRefundedCancelledTransactions";
import AdminCancelledTransact from "./AdminCancelledTransact";
import axiosInstance from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminStatCardSkeleton from "../../components/skeleton/AdminStatCardSkeleton";

export default function AdminOrderTransact() {
  const [selectedComponent, setSelectedComponent] = useState("successful");

  const { data: successData, isPending: isSuccessPending } = useQuery({
    queryKey: ["successOrderStats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-successOrder?limit=1`);
      return res.data;
    },
  });

  const { data: failedData, isPending: isFailedPending } = useQuery({
    queryKey: ["failedOrderStats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-failedCancelled?limit=1`);
      return res.data;
    },
  });

  const { data: refundedData, isPending: isRefundedPending } = useQuery({
    queryKey: ["refundedOrderStats"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/order/get-refundedCancelled?limit=1`,
      );
      return res.data;
    },
  });

  const { data: cancelledData, isPending: isCancelledPending } = useQuery({
    queryKey: ["cancelledOrderStats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-cancelled?limit=1`);
      return res.data;
    },
  });

  const handleChangeComponent = (e) => {
    setSelectedComponent(e.target.value);
  };

  const isLoadingStats =
    isSuccessPending ||
    isFailedPending ||
    isRefundedPending ||
    isCancelledPending;

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"Financial Transactions"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-8 flex-col px-4">
        {/* View Selector & Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Management Portal
            </h2>
            <div className="relative group">
              <div className="absolute -inset-1 bg-black rounded-[5px] opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
              <select
                onChange={handleChangeComponent}
                value={selectedComponent}
                className="relative border border-black outline-none py-3 px-6 rounded-[5px] bg-white w-full md:w-[320px] font-black uppercase text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all cursor-pointer appearance-none pr-12"
              >
                <option value="successful">Succesful Orders</option>
                <option value="failed">Failed / Cancelled</option>
                <option value="refunded">Refund History</option>
                <option value="cancelled">Manual Cancellations</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="border-t-[6px] border-t-black border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-black p-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex -space-x-2">
              <div className="size-6 bg-red-400 border border-black rounded-full"></div>
              <div className="size-6 bg-amber-400 border border-black rounded-full"></div>
              <div className="size-6 bg-indigo-400 border border-black rounded-full"></div>
              <div className="size-6 bg-green-400 border border-black rounded-full"></div>
            </div>
            <span className="font-black uppercase text-[11px] tracking-widest px-2 italic text-black">
              Live Transaction Feeds
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-main">
            {Array.from({ length: 4 }).map((_, index) => (
              <AdminStatCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-main">
            <AdminStatCard
              title={"Successful"}
              value={successData?.pagination?.total || 0}
              value2={"Paid"}
            />
            <AdminStatCard
              title={"Failed"}
              value={failedData?.pagination?.total || 0}
              value2={"Unpaid"}
            />
            <AdminStatCard
              title={"Refunded"}
              value={refundedData?.pagination?.total || 0}
              value2={"Returned"}
            />
            <AdminStatCard
              title={"Cancelled"}
              value={cancelledData?.pagination?.total || 0}
              value2={"Void"}
            />
          </div>
        )}

        {/* Dynamic Content Section */}
        <div className="mt-4 transition-all duration-300">
          {selectedComponent === "successful" && (
            <AdminSuccesfullTransactions />
          )}
          {selectedComponent === "failed" && <AdminFailedTransactions />}
          {selectedComponent === "refunded" && (
            <AdminRefundedCancelledTransactions />
          )}
          {selectedComponent === "cancelled" && <AdminCancelledTransact />}
        </div>
      </div>
    </section>
  );
}
