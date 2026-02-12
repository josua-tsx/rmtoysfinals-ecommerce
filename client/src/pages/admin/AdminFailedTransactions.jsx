import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import SingleOrderList from "../../components/SingleOrderList";
import { useState, useEffect } from "react";
import formatPrice from "../../reusable/formatPrice";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminFailedTransactions() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // State for Table
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  const queryClient = useQueryClient();

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // Fetch Data
  const { data, isPending, isError } = useQuery({
    queryKey: ["failedCancelled", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const res = await axiosInstance.get(
        `/order/get-failedCancelled?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const failedCancelledData = data?.orders || [];
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

  const { mutate: cancelSuccessMutation } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(
        `/order/cancel-success-transact`,
        orderId,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["failedCancelled"] });
      toast.success("Successfully Cancelled!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleCancelSuccessTransact = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this transaction?")) {
      cancelSuccessMutation({ orderId });
    }
  };

  const handleOpenSingleOrder = (order) => {
    setOrderId(order._id);
    setOpenModal(true);
  };

  if (isError) return <p>Error loading failed transactions.</p>;

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
      header: "FAILED DATE",
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
        <span className="font-black text-xs text-indigo-700">
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
            <span className="font-black uppercase bg-indigo-50 px-2 rounded-full border border-indigo-200 text-black">
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
        <span className="font-black uppercase px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: "REASON",
      className: "px-4 py-4 border-r border-black text-center",
      render: (row) => (
        <div className="flex flex-col items-center gap-1">
          <span className="font-black uppercase text-red-600">
            {row.paymentStatus}
          </span>
          <p className="text-[10px] font-bold text-red-800 leading-tight max-w-[120px]">
            {row.reason}
          </p>
        </div>
      ),
    },
    {
      header: "ACTION",
      className: "px-4 py-4 text-center",
      render: (row) => (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleOpenSingleOrder(row)}
            className="bg-green-400 text-black border border-black py-1 px-3 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            VIEW
          </button>
          <button
            onClick={() => handleCancelSuccessTransact(row._id)}
            className="bg-red-400 text-black border border-black py-1 px-3 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            CANCEL
          </button>
        </div>
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
        title="Failed Transactions"
        subtitle="Viewing history of failed or cancelled payments"
        headerColor="bg-[#dc2626]"
        columns={columns}
        data={failedCancelledData}
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
        emptyMessage="No failed transactions found"
      />
    </>
  );
}
