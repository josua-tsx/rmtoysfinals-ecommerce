import { useState } from "react";
import formatPrice from "../../reusable/formatPrice";
import { IoSearch } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminOrderStockHistoryTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: stockHistory,
    isPending: isStockHistoryPending,
    isError: isStockHistoryError,
  } = useQuery({
    queryKey: ["stochHistory"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/history/get-stock-history`);
      return res.data;
    },
  });

  const arrayStocks = Array.isArray(stockHistory) ? stockHistory : [];

  const filteredArrayStocks = arrayStocks.filter(
    (stock) =>
      stock.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock?.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock?.supplier?.supplierName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock?.receivedDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock?.totalCost
        .toString()
        .toLowerCase()
        .includes(searchTerm.toString().toLowerCase()) ||
      stock?.quantityOrdered
        .toString()
        .toLowerCase()
        .includes(searchTerm.toString().toLowerCase()) ||
      stock?.receivedQuantity
        .toString()
        .toLowerCase()
        .includes(searchTerm.toString().toLowerCase())
  );

  if (isStockHistoryError) return <p>Error.</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-white border-2 border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Stock History
        </h1>
      </div>

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className="border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-6">
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search stocks id, product name, supplier name, category name"
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto h-[600px] py-3">
        {isStockHistoryPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead className="bg-[#fffdf6] sticky top-0 z-10">
              <tr className="border-b border-black">
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Delivery ID
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  User
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Action
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Qty Ordered
                </th>
                <th className="px-4 py-4 text-left font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Supplier Name
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Supplier Price
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Shipping
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Shop Price
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Vat Applied
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Received Date
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest border-r border-black text-black">
                  Received Qty
                </th>
                <th className="px-4 py-4 text-center font-black uppercase text-[13px] tracking-widest text-black">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[13px] font-bold">
              {filteredArrayStocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No stocks available
                  </td>
                </tr>
              ) : (
                filteredArrayStocks.map((stock) => (
                  <tr key={stock._id}>
                    {/* <td className="px-4">{stock._id}</td> */}
                    <td className=" px-4 gap-2">{stock?.deliveryId}</td>
                    <td className=" px-4 gap-2">{stock?.userId?.username}</td>
                    <td className=" px-4 gap-2">{stock?.action}</td>
                    <td className="text-center">{stock?.quantityOrdered}</td>
                    <td className="text-center">
                      {stock?.supplier?.supplierName}
                    </td>
                    <td className="text-center">
                      {formatPrice(stock?.supplierPrice)} PHP
                    </td>
                    <td className="text-center">
                      {formatPrice(stock?.shippingPrice)} PHP
                    </td>
                    <td className="text-center">
                      {formatPrice(stock?.shopPrice)} PHP
                    </td>
                    <td className="text-center">{stock?.vatPercentApplied}</td>
                    <td className="text-center flex flex-col">
                      <span>{stock?.receivedDate}</span>
                      <span>
                        {new Date(stock?.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="text-center ">{stock?.receivedQuantity}</td>
                    <td className="text-center px-4">
                      {formatPrice(stock?.totalCost)} PHP
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
