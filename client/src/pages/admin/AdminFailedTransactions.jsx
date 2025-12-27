import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import SingleOrderList from "../../components/SingleOrderList";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";

import formatPrice from "../../reusable/formatPrice";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminFailedTransactions({
  failedCancelledData,
  isFailedCancelledPending,
  isFailedCancelledError,
}) {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  console.log(failedCancelledData);

  const arrayCustomerFailed = Array.isArray(failedCancelledData)
    ? failedCancelledData
    : [];

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
        orderId
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
    cancelSuccessMutation({ orderId });
  };

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const filteredFailedOrder = arrayCustomerFailed.filter(
    (failed) =>
      failed._id.includes(searchTerm) ||
      failed?.userId?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      failed.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      failed.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      failed.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isFailedCancelledError) return <p>Error.</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Red Sticker Header for Failed Transactions */}
      <div className="absolute -top-4 -left-3 bg-[#dc2626] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Failed Transactions
        </h1>
      </div>

      {openModal && singleUserOrder && (
        <SingleOrderList
          order={singleUserOrder}
          onClose={() => setOpenModal(false)}
        />
      )}

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 pt-8 bg-gray-50/50">
        <div className="hidden md:block">
          <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
            Viewing history of failed or cancelled payments
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
        {isFailedCancelledPending ? (
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
                  ORDER DATE
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  FAILED DATE
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
                  REASON
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest text-black">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredFailedOrder?.length > 0 ? (
                filteredFailedOrder.map((failed) => {
                  const totalItems =
                    failed.orderItems?.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr
                      key={failed._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4 border-r border-black font-mono text-black">
                        #{failed._id.slice(-6)}...
                      </td>
                      <td className="px-4 py-4 border-r border-black">
                        <div className="flex flex-col">
                          <span className="uppercase text-black truncate max-w-[150px]">
                            {failed?.userId
                              ? failed?.userId?.email
                              : failed?.guestUser?.email}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 italic">
                            {failed.userId ? "MEMBER" : "GUEST"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <span className="text-gray-600">
                          {new Date(failed.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <span className="text-gray-600">
                          {new Date(failed.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <span className="font-black text-xs text-indigo-700">
                          {formatPrice(failed.totalPrice)} PHP
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black uppercase bg-indigo-50 px-2 rounded-full border border-indigo-200 text-black">
                            {totalItems} ITEMS
                          </span>
                          <span className="text-[10px] font-mono font-bold text-gray-500 mt-1">
                            {failed.userId
                              ? failed.userId?.phoneNumber
                              : failed.guestUser.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <span className="font-black uppercase px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                          {failed.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-black uppercase text-red-600">
                            {failed.paymentStatus}
                          </span>
                          <p className="text-[10px] font-bold text-red-800 leading-tight max-w-[120px]">
                            {failed.reason}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleOpenSingleOrder(failed)}
                            className="bg-green-400 text-black border border-black py-1 px-3 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          >
                            VIEW
                          </button>
                          <button
                            onClick={() =>
                              handleCancelSuccessTransact(failed._id)
                            }
                            className="bg-red-400 text-black border border-black py-1 px-3 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                          >
                            CANCEL
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-gray-400 font-black uppercase tracking-widest text-xs">
                        No failed transactions found
                      </span>
                    </div>
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
