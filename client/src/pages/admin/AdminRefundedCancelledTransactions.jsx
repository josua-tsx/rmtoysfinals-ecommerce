import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState, useEffect } from "react";
import SingleOrderList from "../../components/SingleOrderList";
import formatPrice from "../../reusable/formatPrice";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminRefundedCancelledTransactions() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // State for Table
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // Fetch Data
  const { data, isPending, isError } = useQuery({
    queryKey: ["refundedCancelled", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const res = await axiosInstance.get(
        `/order/get-refundedCancelled?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const refundedCancelled = data?.orders || [];
  const totalPages = data?.pagination?.totalPages || 0;
  const totalItems = data?.pagination?.total || 0;
  const currentPage = data?.pagination?.page || 1;

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const handleOpenSingleOrder = (order) => {
    setOrderId(order._id);
    setOpenModal(true);
  };

  if (isError) return <p>Error loading refunded/cancelled transactions.</p>;

  // Columns
  const columns = [
    {
      header: "ORDER ID",
      className:
        "px-4 py-4 border-r border-black font-mono text-black text-left",
      render: (row) => `#${row._id.slice(-6).toUpperCase()}...`,
    },
    {
      header: "CUSTOMER",
      className: "px-4 py-4 border-r border-black text-left",
      render: (row) => (
        <div className="flex flex-col">
          <span className="uppercase text-black truncate max-w-[150px]">
            {row.userId ? row.userId.email : row.guestUser?.email}
          </span>
          <span className="text-[9px] font-bold text-gray-500 italic">
            {row.userId ? "MEMBER" : "GUEST"}
          </span>
        </div>
      ),
    },
    {
      header: "ORDER DATE",
      className: "px-4 py-4 border-r border-black text-center text-black",
      render: (row) => (
        <span className="text-gray-600">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "REFUNDED DATE",
      className: "px-4 py-4 border-r border-black text-center text-black",
      render: (row) => (
        <span className="text-gray-600">
          {new Date(row.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "AMOUNT",
      className: "px-4 py-4 border-r border-black text-center",
      render: (row) => (
        <span className="text-xs text-indigo-700 font-black">
          {formatPrice(row.totalPrice)} PHP
        </span>
      ),
    },
    {
      header: "INFO",
      className: "px-4 py-4 border-r border-black text-center",
      render: (row) => {
        const totalItems =
          row.orderItems?.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0,
          ) || 0;
        return (
          <div className="flex flex-col items-center">
            <span className="uppercase bg-indigo-50 px-2 rounded-full border border-indigo-200 text-black font-black">
              {totalItems} ITEMS
            </span>
            <span className="text-[10px] font-mono font-bold text-gray-500 mt-1">
              {row.userId ? row.userId.phoneNumber : row.guestUser?.phone}
            </span>
          </div>
        );
      },
    },
    {
      header: "METHOD",
      className: "px-4 py-4 border-r border-black text-center",
      render: (row) => (
        <span className="uppercase px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black font-black">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: "REASON",
      className: "px-4 py-4 border-r-2 border-black text-center",
      render: (row) => (
        <div className="flex flex-col items-center gap-1">
          <span
            className={`text-[10px] font-black uppercase ${
              row.status === "Cancelled" ? "text-red-500" : "text-purple-600"
            }`}
          >
            {row.status}
          </span>
          <p className="text-[9px] font-bold text-gray-500 italic leading-tight max-w-[120px]">
            {row.reason || "Automatic cancellation"}
          </p>
        </div>
      ),
    },
    {
      header: "ACTION",
      className: "px-4 py-4 text-center",
      render: (row) => (
        <button
          onClick={() => handleOpenSingleOrder(row)}
          className="bg-purple-400 text-black border border-black py-1 px-4 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        >
          VIEW
        </button>
      ),
    },
  ];

  return (
    <>
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <ReusableTable
        title="Refunded & Cancelled"
        subtitle="Tracking refunded payments and cancelled orders"
        headerColor="bg-[#7c3aed]"
        columns={columns}
        data={refundedCancelled}
        isLoading={isPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "SEARCH BY ID, EMAIL, METHOD...",
        }}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          onPageChange: setPage,
        }}
        emptyMessage="No records found"
      />
    </>
  );
}
