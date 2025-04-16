import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminSuccesfullTransactions from "./AdminSuccesfullTransactions";
import AdminFailedTransactions from "./AdminFailedTransactions";
import AdminRefundedCancelledTransactions from "./AdminRefundedCancelledTransactions";
import AdminCancelledTransact from "./AdminCancelledTransact";
import axiosInstance from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import AdminStatCard from "../../components/admin/AdminStatCard";

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
    <section className="bg-yellow h-screen">
      <AdminHeader title={"ORDER TRANSACTIONS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <div className="relative">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
          <select
            onChange={handleChangeComponent}
            name=""
            id=""
            value={selectedComponent}
            className="border border-black outline-none p-2 rounded-[5px] bg-card w-full md:w-[300px]"
          >
            <option value="successful">Succesful Transactions</option>
            <option value="failed">Failed Transactions</option>
            <option value="refunded">Order Refunded</option>
            <option value="cancelled">Order Cancelled</option>
          </select>
        </div>
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* CARD */}
          <AdminStatCard
            title={"TOTAL SUCCESSFUL ORDER"}
            value={successOrderData.length}
          />
          <AdminStatCard
            title={"TOTAL FAILED ORDER"}
            value={failedCancelledData.length}
          />
          <AdminStatCard
            title={"TOTAL REFUNDED ORDER"}
            value={refundedCancelled.length}
          />
          <AdminStatCard
            title={"TOTAL CANCELLED ORDER"}
            value={cancelledOrder.length}
          />
        </div>

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
      </div>
    </section>
  );
}
