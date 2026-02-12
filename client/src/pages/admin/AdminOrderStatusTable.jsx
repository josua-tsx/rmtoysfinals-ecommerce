import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import { useState } from "react";
import toast from "react-hot-toast";
import formatPrice from "../../reusable/formatPrice";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import ToShipModal from "../../modals/ToShipModal";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminOrderStatusTable() {
  const queryClient = useQueryClient();
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [openToShipModal, setOpenToShipModal] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState(null);

  const {
    data,
    isPending: isOrdersPending,
    isError: isOrdersError,
  } = useQuery({
    queryKey: ["order", page, debouncedSearch],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/order/get-orders?page=${page}&limit=${limit}&search=${debouncedSearch}`,
      );
      return res.data;
    },
  });

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const { mutate: updateStatusMutation } = useMutation({
    mutationFn: async ({ id, status, riderId }) => {
      const res = await axiosInstance.put(`/order/${id}/status`, {
        status,
        riderId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["notificationLogs"] });
      queryClient.invalidateQueries({ queryKey: ["riders", "riderId"] });
      queryClient.invalidateQueries({ queryKey: ["deliveredCancelled"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      toast.success("Sucessfully Updated Status!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  const confirmOrderStatus = () => {
    updateStatusMutation({
      id: selectedId,
      status: newStatus,
      riderId: selectedRiderId,
    });
    cancelConfirmModal();
  };

  const handleOpenConfirmModal = (id, e) => {
    setSelectedId(id);
    setNewStatus(e.target.value);

    if (e.target.value === "Shipped") {
      setOpenToShipModal(true);
    } else {
      setOpenConfirmModal(true);
    }
  };

  const cancelConfirmModal = () => {
    setSelectedId(null);
    setOpenConfirmModal(false);
    setNewStatus("");
    setSelectedRiderId(null);
  };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const handleCancelOpenShipModal = () => {
    setOpenToShipModal(false);
    setOpenConfirmModal(false);
    setSelectedRiderId(null);
  };

  const handleConfirmToShipModal = () => {
    setOpenToShipModal(false);
    setOpenConfirmModal(true);
  };

  const columns = [
    {
      header: "Order ID",
      accessor: "_id",
      className: "text-left border-r border-black font-mono",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-black">ID: {item._id.slice(-6)}</span>
          <span className="text-[9px] text-gray-400 truncate max-w-[80px]">
            {item._id}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: "userId",
      className: "text-left border-r border-black",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-black truncate max-w-[150px]">
            {item?.userId?.fullName}
          </span>
          <span className="text-[10px] text-gray-500 truncate max-w-[150px]">
            {item?.userId?.email}
          </span>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "text-center border-r border-black font-mono text-black",
      render: (item) => item?.userId?.phoneNumber,
    },
    {
      header: "Date",
      accessor: "createdAt",
      className: "text-center border-r border-black text-black",
      render: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      header: "Total",
      accessor: "totalPrice",
      className:
        "text-center border-r border-black font-mono font-black text-indigo-700",
      render: (item) => formatPrice(item.totalPrice),
    },
    {
      header: "Points",
      accessor: "totalPoints",
      className:
        "text-center border-r border-black font-mono font-bold text-green-600",
      render: (item) => `+${formatPrice(item.totalPoints)}`,
    },
    {
      header: "Used",
      accessor: "usedCredits",
      className:
        "text-center border-r border-black font-mono font-bold text-red-500",
      render: (item) =>
        `-${item?.usedCredits ? formatPrice(item.usedCredits) : 0}`,
    },
    {
      header: "Payment",
      accessor: "paymentMethod",
      className: "text-center border-r border-black",
      render: (item) => (
        <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {item.paymentMethod}
        </span>
      ),
    },
    {
      header: "Pay Status",
      accessor: "paymentStatus",
      className: "text-center border-r border-black",
      render: (item) => (
        <span
          className={`px-2 py-0.5 border border-black rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            item?.paymentStatus === "Failed" ||
            item?.paymentStatus === "Refunded"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {item.paymentStatus}
        </span>
      ),
    },
    {
      header: "Order Status",
      accessor: "status",
      className: "text-center border-r border-black",
      render: (item) => (
        <span
          className={`px-2 py-0.5 border border-black rounded-[3px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            item?.status === "Cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      className: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleOpenSingleOrder(item)}
            title="View Details"
            className="px-3 py-1.5 border border-black bg-white text-black font-black uppercase rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            View
          </button>
          <select
            name="status"
            id="status"
            onChange={(e) => handleOpenConfirmModal(item._id, e)}
            value={item.status}
            className="border border-black p-1 font-black uppercase outline-none rounded-[5px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      ),
    },
  ];

  if (isOrdersError) return <p>error.</p>;

  return (
    <>
      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={openConfirmModal}
        onCancel={cancelConfirmModal}
        onConfirm={confirmOrderStatus}
        title={"Update Order Status"}
        message={"Are you sure you want to update the order status?"}
      />

      <ToShipModal
        selectedRiderId={selectedRiderId}
        setSelectedRiderId={setSelectedRiderId}
        isOpen={openToShipModal}
        onConfirm={handleConfirmToShipModal}
        onCancel={handleCancelOpenShipModal}
      />

      <ReusableTable
        title="Member Orders"
        subtitle="Managing registered member orders and tracking delivery status"
        headerColor="bg-[#22c55e]"
        columns={columns}
        data={orders}
        isLoading={isOrdersPending}
        search={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "SEARCH BY ID, EMAIL...",
        }}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: totalItems,
          onPageChange: setPage,
        }}
        emptyMessage="NO ORDER FOUND"
      />
    </>
  );
}
