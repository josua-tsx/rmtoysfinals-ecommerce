import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import formatPrice from "../../reusable/formatPrice";
import AdminOrderRestockModal from "./AdminOrderRestockModal";
import ReduceQuantityModal from "../ReduceQuantityModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useUserStore } from "../../stores/useUserStore";

export default function AdminStocksTable() {
  const currentUser = useUserStore((state) => state.currentUser);

  // const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [reduceModal, setReduceModal] = useState(false);

  const [deliveryId, setDeliveryId] = useState(null);
  const [singleDataStock, setSingleDataStock] = useState();

  const {
    data: stocks = [],
    isLoading: isStocksPending,
    isError: isStocksError,
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/get-stocks`);
      return res.data;
    },
  });

  console.log(stocks);

  useQuery({
    queryKey: ["singleDeliveredProduct", deliveryId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/get-stocks/${deliveryId}`);
      return res.data;
    },
    enabled: !!deliveryId,
  });

  const openReduceModal = (stock) => {
    setDeliveryId(stock._id);
    setReduceModal(true);
    setSingleDataStock(stock);
  };

  const closeReduceModal = () => {
    setDeliveryId(null);
    setReduceModal(false);
    setSingleDataStock(null);
  };

  const openSingleStockData = (stock) => {
    setDeliveryId(stock._id);
    setOpenModal(true);
    setSingleDataStock(stock);
  };

  const closeSingleStockData = () => {
    setDeliveryId(null);
    setOpenModal(false);
    setSingleDataStock(null);
  };

  const arrayStocks = Array.isArray(stocks) ? stocks : [];

  const filteredArrayStocks = arrayStocks.filter(
    (stock) =>
      stock.deliveryId.includes(searchTerm) ||
      stock?.product?.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock?.supplier?.supplierName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock?.category?.categoryName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock?.quantity
        .toString()
        .toLowerCase()
        .includes(searchTerm.toString().toLowerCase())
  );

  if (isStocksError) {
    return <p>Something went wrong.</p>;
  }

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Stocks Table
        </h1>
      </div>

      {openModal && (
        <AdminOrderRestockModal
          singleStock={singleDataStock}
          onClose={closeSingleStockData}
        />
      )}

      {reduceModal && (
        <ReduceQuantityModal
          singleStock={singleDataStock}
          onClose={closeReduceModal}
        />
      )}

      <div className="flex-col border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Stocks
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: STK-001..."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto h-[600px] ">
        {isStocksPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black sticky top-0 bg-white z-10">
              <tr>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left bg-white">
                  Delivery ID
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left bg-white">
                  Date
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left bg-white">
                  Product
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left bg-white">
                  Supplier
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left bg-white">
                  Category
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white">
                  Stock
                </th>
                <th
                  className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white"
                  title="Shop Price"
                >
                  S. Price
                </th>
                <th
                  className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white"
                  title="Price with VAT"
                >
                  W/ VAT
                </th>
                <th
                  className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white"
                  title="VAT to Remit"
                >
                  Remit
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white">
                  VAT %
                </th>
                <th
                  className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white"
                  title="Supplier Price"
                >
                  Sup. P
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white">
                  Ship.
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white">
                  Total
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center bg-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredArrayStocks.length === 0 ? (
                <tr>
                  <td
                    colSpan="14"
                    className="p-8 text-center uppercase text-gray-400 tracking-widest"
                  >
                    No stocks available
                  </td>
                </tr>
              ) : (
                filteredArrayStocks.map((stock) => (
                  <tr
                    key={stock._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap font-mono text-black">
                      {stock?.deliveryId}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-tighter text-gray-500">
                          {stock?.dateDelivery}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          {new Date(stock?.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            stock?.product?.productImages[0] ||
                            "fallback-image-url"
                          }
                          className="size-8 rounded-[3px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] object-cover bg-white"
                          alt={stock?.product?.productName}
                        />
                        <span className="tracking-tight max-w-[150px] truncate text-black">
                          {stock?.product?.productName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-600 truncate max-w-[120px]">
                      {stock?.supplier?.supplierName}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {stock?.product?.category?.categoryName}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono">{stock?.quantity}</span>
                        <div
                          className={`size-3 rounded-full border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                            stock?.quantity > 50
                              ? "bg-green-400"
                              : stock?.quantity > 30
                              ? "bg-orange-400"
                              : stock?.quantity >= 1
                              ? "bg-red-400"
                              : "bg-gray-400"
                          }`}
                          title={
                            stock?.quantity > 50
                              ? "High Stock"
                              : stock?.quantity > 30
                              ? "Medium Stock"
                              : stock?.quantity >= 1
                              ? "Low Stock"
                              : "Out of Stock"
                          }
                        ></div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold">
                      {formatPrice(stock?.shopPrice)}
                    </td>
                    <td className="p-4 text-center font-mono font-bold">
                      {formatPrice(stock?.vatShopPrice)}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-green-600">
                      {formatPrice(stock?.vatToRemit)}
                    </td>
                    <td className="p-4 text-center font-mono font-bold">
                      {stock?.vat?.vatPercent}%
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-red-500">
                      {formatPrice(stock?.supplierPrice)}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-red-500">
                      {formatPrice(stock?.shippingPrice)}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-red-600">
                      {formatPrice(
                        stock?.supplierPrice * stock?.quantity +
                          stock?.shippingPrice
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <button
                          disabled={currentUser.role === "validatorStaff"}
                          onClick={() => openSingleStockData(stock)}
                          className={`${
                            currentUser.role === "validatorStaff"
                              ? "hidden"
                              : "block"
                          } border border-black p-1.5 px-3 rounded-[5px] bg-[#22c55e] text-black font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50`}
                        >
                          Re-stock
                        </button>
                        <button
                          disabled={currentUser.role === "validatorStaff"}
                          onClick={() => openReduceModal(stock)}
                          className={`${
                            currentUser.role === "validatorStaff"
                              ? "hidden"
                              : "block"
                          } border border-black p-1.5 px-3 rounded-[5px] bg-red-500 text-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50`}
                        >
                          Reduce
                        </button>
                      </div>
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
