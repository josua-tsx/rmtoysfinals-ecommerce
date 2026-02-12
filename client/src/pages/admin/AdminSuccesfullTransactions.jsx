import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import toast from "react-hot-toast";
import formatPrice from "../../reusable/formatPrice";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminSuccesfullTransactions() {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // FOR REFUND
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // FOR CANCEL
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelSelectedId, setIsCancelSelectedId] = useState(null);

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
    queryKey: ["successOrder", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const res = await axiosInstance.get(
        `/order/get-successOrder?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const successOrderData = data?.orders || [];
  const totalPages = data?.pagination?.totalPages || 0;
  const totalItems = data?.pagination?.total || 0;
  const currentPage = data?.pagination?.page || 1;

  // Single Order Query
  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  // Mutations
  const { mutate: updateToRefundMutation } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(`/order/refund-order`, orderId);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["successOrder"] });
      queryClient.invalidateQueries({ queryKey: ["refundedCancelled"] });
      toast.success(`Updated to refunded`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
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
      queryClient.invalidateQueries({ queryKey: ["successOrder"] });
      toast.success("Successfully Cancelled!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  // Handlers
  const handleRefundClick = (orderId) => {
    setSelectedId(orderId);
    setIsModalOpen(true);
  };

  const handleUpdateToRefunded = () => {
    if (selectedId) {
      updateToRefundMutation({ orderId: selectedId });
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedId(null);
    setIsModalOpen(false);
  };

  const handleOpenCancelSuccess = (orderId) => {
    setIsCancelModalOpen(true);
    setIsCancelSelectedId(orderId);
  };

  const handleCloseCancelSuccess = () => {
    setIsCancelModalOpen(false);
    setIsCancelSelectedId(null);
  };

  const handleCancelSuccessTransact = () => {
    if (isCancelSelectedId) {
      cancelSuccessMutation({ orderId: isCancelSelectedId });
      handleCloseCancelSuccess();
    }
  };

  const handleOpenSingleOrder = (order) => {
    setOrderId(order._id);
    setOpenModal(true);
  };

  if (isError) return <p>Error loading success transactions</p>;

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
          <span className="uppercase truncate max-w-[150px] text-black">
            {row.userId ? row.userId.email : row.guestUser?.email}
          </span>
          <span className="text-[9px] font-black uppercase text-gray-500">
            {row.userId ? "MEMBER" : "GUEST"}
          </span>
        </div>
      ),
    },
    {
      header: "DATE",
      className: "px-4 py-4 border-r border-black text-center text-black",
      render: (row) => (
        <span className="text-gray-600">
          {new Date(row.createdAt).toLocaleDateString()}
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
        const totalItemsBought =
          row.orderItems?.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0,
          ) || 0;
        return (
          <div className="flex flex-col items-center">
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full font-black uppercase text-[9px] text-black">
              {totalItemsBought} ITEMS
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
      className: "px-4 py-4 border-r border-black text-center",
      render: (row) => (
        <span className="px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-black text-[12px]">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: "STATUS",
      className: "px-4 py-4 border-r border-black text-center",
      render: (row) => (
        <div className="flex flex-col items-center gap-1">
          <span className="text-green-600 font-black uppercase text-[12px]">
            {row.paymentStatus}
          </span>
          <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[9px]">
            {row.status}
          </span>
        </div>
      ),
    },
    {
      header: "ADDRESS",
      className: "px-4 py-4 border-r border-black max-w-[200px] text-left",
      render: (row) => (
        <p className="truncate text-gray-500 italic text-[12px]">
          {row.userId?.address?.[0]?.fullAddress || row.shippingAddress}
        </p>
      ),
    },
    {
      header: "ACTION",
      className: "px-4 py-4 text-center",
      render: (row) => (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleOpenSingleOrder(row)}
            className="bg-indigo-400 text-black border border-black py-1 px-3 rounded-[5px] font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            VIEW
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenCancelSuccess(row._id)}
              className="flex-1 bg-red-400 text-black border border-black py-1 px-2 rounded-[5px] font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              CANCEL
            </button>
            <button
              onClick={() => handleRefundClick(row._id)}
              className="flex-1 bg-amber-400 text-black border border-black py-1 px-2 rounded-[5px] font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              REFUND
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Modals outside table */}
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title={"Update to refund"}
        message={
          "Are you sure you want to refund this order? This action can not be undone."
        }
        onConfirm={handleUpdateToRefunded}
        onCancel={handleCancel}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title={"Cancel Success Order"}
        message={
          "Are you sure you want to cancel this order? This action can not be undone."
        }
        onConfirm={handleCancelSuccessTransact}
        onCancel={handleCloseCancelSuccess}
      />

      <ReusableTable
        title="Successful Transactions"
        subtitle="History of completed payments and successful orders"
        columns={columns}
        data={successOrderData}
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
        emptyMessage="No successful transactions found"
      />
    </>
  );
}
