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
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";

export default function AdminOrderTransact() {
  const [selectedComponent, setSelectedComponent] = useState("successful");

  const {
    data: successOrderData = [],
    isPending: isSuccessPending,
    isError: isSuccessError,
  } = useQuery({
    queryKey: ["successOrder"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-successOrder`);
      return res.data;
    },
  });

  const {
    data: failedCancelledData = [],
    isPending: isFailedCancelledPending,
    isError: isFailedCancelledError,
  } = useQuery({
    queryKey: ["failedCancelled"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-failedCancelled`);
      return res.data;
    },
  });

  const {
    data: refundedCancelled = [],
    isPending: isRefundedCancelledPending,
    isError: isRefundedCancelledError,
  } = useQuery({
    queryKey: ["refundedCancelled"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-refundedCancelled`);
      return res.data;
    },
  });

  const {
    data: cancelledOrder = [],
    isPending: iscancelledOrderPending,
    isError: iscancelledOrderError,
  } = useQuery({
    queryKey: ["cancelledOrder"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-cancelled`);
      return res.data;
    },
  });

  const handleChangeComponent = (e) => {
    const componentChange = e.target.value;

    setSelectedComponent(componentChange);
  };

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
        {isSuccessPending ||
        isFailedCancelledPending ||
        isRefundedCancelledPending ||
        iscancelledOrderPending ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-main">
            {Array.from({ length: 4 }).map((_, index) => (
              <AdminStatCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-main">
            <AdminStatCard
              title={"Successful"}
              value={successOrderData.length}
              value2={"Paid"}
            />
            <AdminStatCard
              title={"Failed"}
              value={failedCancelledData.length}
              value2={"Unpaid"}
            />
            <AdminStatCard
              title={"Refunded"}
              value={refundedCancelled.length}
              value2={"Returned"}
            />
            <AdminStatCard
              title={"Cancelled"}
              value={cancelledOrder.length}
              value2={"Void"}
            />
          </div>
        )}

        {/* Dynamic Content Section */}
        <div className="mt-4 transition-all duration-300">
          {isSuccessPending ||
          isFailedCancelledPending ||
          isRefundedCancelledPending ||
          iscancelledOrderPending ? (
            <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible p-4">
              <AdminTableSkeleton />
            </div>
          ) : (
            <>
              {selectedComponent === "successful" && (
                <AdminSuccesfullTransactions
                  successOrderData={successOrderData}
                  isSuccessPending={isSuccessPending}
                  isSuccessError={isSuccessError}
                />
              )}
              {selectedComponent === "failed" && (
                <AdminFailedTransactions
                  failedCancelledData={failedCancelledData}
                  isFailedCancelledPending={isFailedCancelledPending}
                  isFailedCancelledError={isFailedCancelledError}
                />
              )}
              {selectedComponent === "refunded" && (
                <AdminRefundedCancelledTransactions
                  refundedCancelled={refundedCancelled}
                  isRefundedCancelledPending={isRefundedCancelledPending}
                  isRefundedCancelledError={isRefundedCancelledError}
                />
              )}
              {selectedComponent === "cancelled" && (
                <AdminCancelledTransact
                  cancelledOrder={cancelledOrder}
                  iscancelledOrderPending={iscancelledOrderPending}
                  iscancelledOrderError={iscancelledOrderError}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
