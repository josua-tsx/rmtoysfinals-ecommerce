import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import formatPrice from "../../reusable/formatPrice";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import ToShipModal from "../../modals/ToShipModal";

export default function AdminOrderGuestStatus() {
  const queryClient = useQueryClient();
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [openToShipModal, setOpenToShipModal] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState(null);

  const {
    data: allOrders = [],
    isPending: isOrdersPending,
    isError: isOrdersError,
  } = useQuery({
    queryKey: ["order"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-guest-orders`);
      return res.data;
    },
  });

  console.log(allOrders);

  const arrayAllOrders = Array.isArray(allOrders) ? allOrders : [];

  const filteredArrayAllOrders = arrayAllOrders.filter(
    (order) =>
      order._id.includes(searchTerm) ||
      order.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      queryClient.invalidateQueries({ queryKey: ["deliveredCancelled"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["riders", "riderId"] });
      toast.success("Sucessfully Updated Status!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong");
    },
  });

  // const handleChangeStatus = (id, e) => {
  //   const newStatus = e.target.value;

  //   updateStatusMutation({ id, status: newStatus });
  // };

  const confirmOrderStatus = () => {
    // if (newStatus === "Shipped" && selectedRiderId === null) {"You must pick a rider to update status to shipped."
    //   return toast.error("You must pick a rider to update status to shipped.");
    // }

    updateStatusMutation({
      id: selectedId,
      status: newStatus,
      riderId: selectedRiderId,
    });
    cancelConfirmModal();
  };

  console.log(selectedRiderId);

  // New signature:
  const handleOpenConfirmModal = (id, e) => {
    setSelectedId(id);
    setNewStatus(e.target.value);

    if (e.target.value === "Shipped") {
      // For Shipped, only open rider selection modal first
      setOpenToShipModal(true);
    } else {
      // For other statuses, open confirm modal directly
      setOpenConfirmModal(true);
    }
  };

  const cancelConfirmModal = () => {
    setSelectedId(null);
    setOpenConfirmModal(false);
    setNewStatus("");
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
    // After rider is selected, NOW open the confirmation modal
    setOpenConfirmModal(true);
  };

  if (isOrdersError) return <p>error.</p>;

  return (
    <div className="font-main border rounded-[5px] text-sm md:text-normal border-black bg-card relative mt-8 overflow-visible">
      {/* Amber Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#f59e0b] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Guest Orders
        </h1>
      </div>
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

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 pt-8 bg-gray-50/50">
        <div className="hidden md:block">
          <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
            Tracking orders from guest users and managing status updates
          </p>
        </div>
        <div className="flex items-center relative group w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH BY ID, EMAIL..."
            className="border border-black w-full md:w-[350px] rounded-[5px] py-2 pl-4 pr-10 focus:outline-none font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all placeholder:text-gray-300"
          />
          <IoSearch
            className="absolute right-3 text-black group-focus-within:scale-110 transition-transform"
            size={20}
          />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] ">
        {isOrdersPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="border-b border-black sticky top-0 bg-white z-10">
              <tr className="">
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  ORDER ID
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  EMAIL
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  NAME
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  PHONE
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  ADDRESS
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  DATE
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  AMOUNT
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  METHOD
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  PAYMENT
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  STATUS
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest text-black">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredArrayAllOrders?.length > 0 ? (
                filteredArrayAllOrders?.map((data) => (
                  <tr
                    key={data._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4 border-r border-black font-mono text-black">
                      #{data._id.slice(-6)}
                    </td>

                    <td className="px-4 py-4 border-r border-black">
                      <span className="text-black truncate max-w-[150px] block">
                        {data?.guestUser?.email}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-r border-black">
                      <span className="text-black truncate max-w-[150px] block">
                        {data?.guestUser?.name}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center text-black font-mono">
                      {data?.guestUser?.phone}
                    </td>
                    <td className="px-4 py-4 border-r border-black text-black">
                      <span className="truncate max-w-[150px] block text-[10px]">
                        {data?.shippingAddress}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-r border-black text-center text-black">
                      {new Date(data?.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center font-mono font-black text-indigo-700">
                      {formatPrice(data?.totalPrice)}
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <span className="px-2 py-1 border border-black bg-white rounded-[5px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {data?.paymentMethod}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <span
                        className={`px-2 py-1 border border-black rounded-[5px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          data?.paymentStatus === "Failed" ||
                          data?.paymentStatus === "Refunded"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {data?.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <span
                        className={`px-2 py-1 border border-black rounded-[5px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          data?.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {data?.status}
                      </span>
                    </td>
                    {/* 
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">{data.status}</td> */}
                    {/* <td className="px-6 py-4 whitespace-nowrap text-center text-sm"></td> */}

                    {/* <td className="px-4 py-4 whitespace-nowrap text-cener text-sm">
                {product.stocks}
              </td> */}
                    <td className="px-4 py-4 flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleOpenSingleOrder(data)}
                        className="px-3 py-1.5 border border-black bg-white text-black font-black uppercase rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                      >
                        VIEW
                      </button>

                      <div>
                        <select
                          name="status"
                          id="status"
                          onChange={(e) => handleOpenConfirmModal(data._id, e)}
                          value={data.status}
                          className="border border-black p-1 font-black uppercase outline-none rounded-[5px] bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"
                        >
                          <option value="Pending">🕒 Pending</option>
                          <option value="Processing">⚙️ Processing</option>
                          <option value="Shipped">📦 Shipped</option>
                          <option value="Out for Delivery">🚚 Delivery</option>
                          <option value="Delivered">✔️ Delivered</option>
                          <option value="Cancelled">❌ Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <p>no order.</p>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
