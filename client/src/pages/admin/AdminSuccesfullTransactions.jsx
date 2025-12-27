import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import formatPrice from "../../reusable/formatPrice";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminSuccesfullTransactions({
  successOrderData,
  isSuccessPending,
  isSuccessError,
}) {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // FOR REFUND
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // FOR CANCEL
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelSelectedId, setIsCancelSelectedId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const arraySuccessOrder = Array.isArray(successOrderData)
    ? successOrderData
    : [];

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  console.log(successOrderData);

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

  const handleRefundClick = (orderId) => {
    setSelectedId(orderId);
    setIsModalOpen(true);
  };

  const handleUpdateToRefunded = () => {
    if (selectedId) {
      {
        updateToRefundMutation({ orderId: selectedId });
        setIsModalOpen(false);
      }
    }
  };

  const handleCancel = () => {
    setSelectedId(null);
    setIsModalOpen(false);
  };

  const { mutate: cancelSuccessMutation } = useMutation({
    mutationFn: async (orderId) => {
      const res = await axiosInstance.put(
        `/order/cancel-success-transact`,
        orderId
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

  const filteredSuccessOrder = arraySuccessOrder.filter(
    (success) =>
      success?.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      success?.userId?.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      success?.userId?._id.includes(searchTerm) ||
      success?._id.includes(searchTerm) ||
      success?.paymentMethod.toLowerCase().includes(searchTerm) ||
      success?.status.toLowerCase().includes(searchTerm)
  );

  const handleCancelSuccessTransact = () => {
    if (isCancelSelectedId) {
      cancelSuccessMutation({ orderId: isCancelSelectedId });
      handleCloseCancelSuccess();
    }
  };

  const handleOpenCancelSuccess = (orderId) => {
    setIsCancelModalOpen(true);
    setIsCancelSelectedId(orderId);
  };

  const handleCloseCancelSuccess = () => {
    setIsCancelModalOpen(false);
    setIsCancelSelectedId(null);
  };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  if (isSuccessError) return <p>Error</p>;

  return (
    <div className="font-main text-sm md:text-normal border rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Green Sticker Header for Successful Transactions */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Successful Transactions
        </h1>
      </div>

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

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 pt-8 bg-gray-50/50">
        <div className="hidden md:block">
          <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
            History of completed payments and successful orders
          </p>
        </div>
        <div className="flex items-center relative group w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH BY ID, EMAIL, METHOD..."
            className="border border-black w-full md:w-[350px] rounded-[5px] py-2 pl-4 pr-10 focus:outline-none font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all placeholder:text-gray-300"
          />
          <IoSearch
            className="absolute right-3 text-black group-focus-within:scale-110 transition-transform"
            size={20}
          />
        </div>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        {isSuccessPending ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-black">
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  ORDER ID
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  CUSTOMER
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  DATE
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  AMOUNT
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  INFO
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  METHOD
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  STATUS
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  ADDRESS
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest text-black">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredSuccessOrder.length > 0 ? (
                filteredSuccessOrder.map((success) => {
                  const totalItemsBought =
                    success.orderItems?.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr
                      key={success?._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4 border-r border-black font-mono text-black">
                        #{success?._id.slice(-6)}...
                      </td>
                      <td className="px-4 py-4 border-r border-black">
                        <div className="flex flex-col">
                          <span className="uppercase truncate max-w-[150px] text-black">
                            {success?.userId
                              ? success?.userId?.email
                              : success?.guestUser?.email}
                          </span>
                          <span className="text-[9px] font-black uppercase text-gray-500">
                            {success.userId ? "MEMBER" : "GUEST"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <span className="text-gray-600">
                          {new Date(success.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <span className="font-black text-xs text-indigo-700">
                          {formatPrice(success.totalPrice)} PHP
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <div className="flex flex-col items-center">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded-full font-black uppercase text-[9px] text-black">
                            {totalItemsBought} ITEMS
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 mt-1">
                            {success.userId
                              ? success.userId?.phoneNumber
                              : success?.guestUser?.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <span className="px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-black">
                          {success.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-green-600 font-black uppercase">
                            {success.paymentStatus}
                          </span>
                          <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-[9px]">
                            {success.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black max-w-[200px]">
                        <p className="truncate text-gray-500 italic">
                          {success.userId?.address[0]?.fullAddress ||
                            success.shippingAddress}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleOpenSingleOrder(success)}
                            className="bg-indigo-400 text-black border border-black py-1 px-3 rounded-[5px] font-black uppercase text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          >
                            VIEW
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleOpenCancelSuccess(success._id)
                              }
                              className="flex-1 bg-red-400 text-black border border-black py-1 px-2 rounded-[5px] font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              CANCEL
                            </button>
                            <button
                              onClick={() => handleRefundClick(success._id)}
                              className="flex-1 bg-amber-400 text-black border border-black py-1 px-2 rounded-[5px] font-black uppercase text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                            >
                              REFUND
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="p-12 text-center text-gray-400 font-black uppercase tracking-widest text-xs"
                  >
                    No successful transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
