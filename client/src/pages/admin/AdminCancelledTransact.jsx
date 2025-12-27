import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axiosInstance from "../../lib/axios";
import SingleOrderList from "../../components/SingleOrderList";
import { IoSearch } from "react-icons/io5";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminCancelledTransact({
  cancelledOrder,
  iscancelledOrderPending,
  iscancelledOrderError,
}) {
  const [orderId, setOrderId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // const queryClient = useQueryClient();

  console.log(cancelledOrder);

  const arrayCancelledOrder = Array.isArray(cancelledOrder)
    ? cancelledOrder
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

  const filteredArrayCancelledOrder = arrayCancelledOrder.filter(
    (cancelled) =>
      cancelled._id.includes(searchTerm) ||
      cancelled?.userId?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cancelled?.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (iscancelledOrderError) return <p>Error.</p>;

  return (
    <div className="font-main text-sm md:text-normal border rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Grey Sticker Header for Cancelled Transactions */}
      <div className="absolute -top-4 -left-3 bg-[#475569] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Cancelled Orders
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
            Reviewing orders that were cancelled by the user or admin
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
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        {iscancelledOrderPending ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-black">
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  ORDER ID
                </th>
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  CUSTOMER
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  ORDER DATE
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  INFO
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  METHOD
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  STATUS
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest text-black">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[13px] font-bold">
              {filteredArrayCancelledOrder?.length > 0 ? (
                filteredArrayCancelledOrder.map((cancel) => {
                  const totalItems =
                    cancel.orderItems?.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0
                    ) || 0;

                  return (
                    <tr
                      key={cancel._id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-4 py-4 border-r border-black font-mono text-black">
                        #{cancel._id.slice(-6)}...
                      </td>
                      <td className="px-4 py-4 border-r border-black">
                        <div className="flex flex-col">
                          <span className="font-black uppercase text-black truncate max-w-[150px]">
                            {cancel?.userId
                              ? cancel?.userId?.email
                              : cancel?.guestUser?.email}
                          </span>
                          <span className="text-[9px] font-black uppercase text-gray-500">
                            {cancel.userId ? "MEMBER" : "GUEST"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <span className="text-gray-600">
                          {new Date(cancel.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <div className="flex flex-col items-center">
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-full font-black uppercase text-[9px] text-black">
                            {totalItems} ITEMS
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 mt-1">
                            {cancel.userId
                              ? cancel.userId?.phoneNumber
                              : cancel?.guestUser?.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center text-black">
                        <span className="px-2 py-1 bg-white border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase">
                          {cancel.paymentMethod || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-black text-center">
                        <span className="text-red-600 font-black uppercase">
                          {cancel.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleOpenSingleOrder(cancel)}
                          className="bg-slate-400 text-black border border-black py-1 px-4 rounded-[5px] font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          VIEW
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="p-12 text-center text-gray-400 font-black uppercase tracking-widest text-xs"
                  >
                    No cancelled transactions found
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
