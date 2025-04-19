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
      stock.deliveryId.includes(searchTerm) ||
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
    <div className="font-main border rounded-[5px] border-black bg-card relative">
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className="border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4">
        <h1>ORDER / REORDER STOCK HISTORY</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search stocks id, product name, supplier name, category name"
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto h-[600px] py-3">
        {isStockHistoryPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr>
                {/* <th className="font-normal p-2 pb-5">ID</th> */}
                <th className="font-normal p-2 pb-5">Delivery ID</th>
                <th className="font-normal p-2 pb-5">User</th>
                <th className="font-normal p-2 pb-5">Action</th>
                <th className="font-normal p-2 pb-5">Quantity Ordered</th>
                <th className="font-normal p-2 pb-5">Supplier Name</th>
                <th className="font-normal p-2 pb-5">Supplier Price</th>
                <th className="font-normal p-2 pb-5">Shipping Price</th>
                <th className="font-normal p-2 pb-5">Shop Price</th>
                <th className="font-normal p-2 pb-5">Vat Applied</th>
                <th className="font-normal p-2 pb-5">Recieved Date</th>
                <th className="font-normal p-2 pb-5">Recieved Quantity</th>
                <th className="font-normal p-2 pb-5">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
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
