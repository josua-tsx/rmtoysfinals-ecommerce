import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import SingleOrderList from "../../components/SingleOrderList";
import { IoSearch } from "react-icons/io5";
import formatPrice from "../../reusable/formatPrice";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminRefundedCancelledTransactions({
  refundedCancelled,
  isRefundedCancelledPending,
  isRefundedCancelledError,
}) {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");

  const arrayRefundedCancelled = Array.isArray(refundedCancelled)
    ? refundedCancelled
    : [];

  const { data: singleUserOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/${orderId}`);
      return res.data;
    },
    enabled: !!orderId,
  });

  const handleOpenSingleOrder = (orderId) => {
    setOrderId(orderId._id);
    setOpenModal(true);
  };

  const filteredRefundedOrder = arrayRefundedCancelled.filter(
    (refunded) =>
      refunded._id.includes(searchTerm) ||
      refunded?.userId?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      refunded?.paymentStatus
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      refunded?.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(refundedCancelled);

  if (isRefundedCancelledError) return <p>Error.</p>;

  return (
    <div className="font-main text-sm md:text-normal border rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Purple Sticker Header for Refunded/Cancelled */}
      <div className="absolute -top-4 -left-3 bg-[#7c3aed] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Refunded & Cancelled
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
            Tracking refunded payments and cancelled orders
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
        {isRefundedCancelledPending ? (
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
                  REFUNDED DATE
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
              {filteredRefundedOrder?.length > 0 ? (
                filteredRefundedOrder.map((refund) => {
                  const totalItems =
                    refund.orderItems?.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr
                      key={refund._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4 border-r border-black font-mono text-black">
                        #{refund._id.slice(-6)}...
                      </td>
                      <td className="px-4 py-4 border-r border-black">
                        <div className="flex flex-col">
                          <span className="uppercase text-black truncate max-w-[150px]">
                            {refund?.userId
                              ? refund?.userId?.email
                              : refund?.guestUser?.email}
                          </span>
                          <span className="text-[9px] font-bold text-gray-500 italic">
                            {refund.userId ? "MEMBER" : "GUEST"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <span className="text-gray-600">
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <span className="text-gray-600">
                          {new Date(refund.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <span className="text-xs text-indigo-700">
                          {formatPrice(refund.totalPrice)} PHP
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <div className="flex flex-col items-center">
                          <span className="uppercase bg-indigo-50 px-2 rounded-full border border-indigo-200 text-black">
                            {totalItems} ITEMS
                          </span>
                          <span className="text-[10px] font-mono font-bold text-gray-500 mt-1">
                            {refund.userId
                              ? refund.userId?.phoneNumber
                              : refund.guestUser?.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <span className="uppercase px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                          {refund.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r-2 border-black text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-[10px] font-black uppercase ${
                              refund.status === "Cancelled"
                                ? "text-red-500"
                                : "text-purple-600"
                            }`}
                          >
                            {refund.status}
                          </span>
                          <p className="text-[9px] font-bold text-gray-500 italic leading-tight max-w-[120px]">
                            {refund.reason || "Automatic cancellation"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleOpenSingleOrder(refund)}
                          className="bg-purple-400 text-black border border-black py-1 px-4 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-gray-400 font-black uppercase tracking-widest text-xs">
                        No records found
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
