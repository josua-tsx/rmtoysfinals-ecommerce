import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminCancelledTransact() {
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
    queryKey: ["cancelledOrder", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const res = await axiosInstance.get(
        `/order/get-cancelled?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const cancelledOrder = data?.orders || [];
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

  if (isError) return <p>Error loading cancelled transactions.</p>;

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
          <span className="font-black uppercase text-black truncate max-w-[150px]">
            {row.userId ? row.userId.email : row.guestUser?.email}
          </span>
          <span className="text-[9px] font-black uppercase text-gray-500">
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
      header: "INFO",
      className: "px-4 py-4 border-r border-black text-center text-black",
      render: (row) => {
        const totalItems =
          row.orderItems?.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0,
          ) || 0;
        return (
          <div className="flex flex-col items-center">
            <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-full font-black uppercase text-[9px] text-black">
              {totalItems} ITEMS
            </span>
            <span className="text-[10px] font-mono text-gray-500 mt-1">
              {row.userId ? row.userId.phoneNumber : row.guestUser?.phone}
            </span>
          </div>
        );
      },
    },
    {
      header: "METHOD",
      className: "px-4 py-4 border-r border-black text-center text-black",
      render: (row) => (
        <span className="px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase">
          {row.paymentMethod || "N/A"}
        </span>
      ),
    },
    {
      header: "STATUS",
      className: "px-4 py-4 border-r border-black text-center",
      render: (row) => (
        <span className="text-red-600 font-black uppercase">{row.status}</span>
      ),
    },
    {
      header: "ACTION",
      className: "px-4 py-4 text-center",
      render: (row) => (
        <button
          onClick={() => handleOpenSingleOrder(row)}
          className="bg-slate-400 text-black border border-black py-1 px-4 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
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
        title="Cancelled Orders"
        subtitle="Reviewing orders that were cancelled by the user or admin"
        headerColor="bg-[#475569]"
        columns={columns}
        data={cancelledOrder}
        isLoading={isPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "SEARCH BY ID, EMAIL...",
        }}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          onPageChange: setPage,
        }}
        emptyMessage="No cancelled transactions found"
      />
    </>
  );
}
