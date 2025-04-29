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
  console.log(currentUser);

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

  const {} = useQuery({
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
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative">
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

      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className="border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4">
        <h1>STOCKS TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search stocks.."
            className="border w-[130px] md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={25} />
        </div>
      </div>
      <div className="overflow-y-auto h-[600px] py-3">
        {isStocksPending ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr>
                {/* <th className="font-normal p-2 pb-5">ID</th> */}
                <th className="font-normal p-2 pb-5">Delivery ID</th>
                <th className="font-normal p-2 pb-5">Delivery Date</th>
                <th className="font-normal p-2 pb-5">Product Name</th>
                <th className="font-normal p-2 pb-5">Supplier Name</th>
                <th className="font-normal p-2 pb-5">Category Name</th>
                <th className="font-normal p-2 pb-5">Quantity in Stock</th>
                <th className="font-normal p-2 pb-5">Shop Price</th>
                <th className="font-normal p-2 pb-5">Shop Price With VAT</th>
                <th className="font-normal p-2 pb-5">VAT to Remit</th>
                <th className="font-normal p-2 pb-5">VAT APPLIED</th>
                <th className="font-normal p-2 pb-5">Supplier Price</th>
                <th className="font-normal p-2 pb-5">Shipping Price</th>
                <th className="font-normal p-2 pb-5">Total Cost</th>

                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
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
                    <td className=" px-4 gap-2">
                      <p>{stock?.dateDelivery}</p>
                      <p>{new Date(stock?.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="flex items-center px-4 gap-2">
                      <img
                        src={
                          stock?.product?.productImages[0] ||
                          "fallback-image-url"
                        } // Optional fallback
                        className="w-[30px]"
                        alt={stock?.product?.productName}
                      />
                      {stock?.product?.productName}
                    </td>
                    <td>{stock?.supplier?.supplierName}</td>
                    <td>{stock?.product?.category?.categoryName}</td>
                    <td>
                      <div className="flex gap-2 items-center w-[56px] justify-between">
                        <p>{formatPrice(stock?.quantity)} </p>
                        {stock?.quantity > 50 ? (
                          <div className="border border-black bg-green-400 rounded-full w-[20px] h-[20px]"></div> // High Stock
                        ) : stock?.quantity > 30 && stock?.quantity <= 50 ? (
                          <div className="border border-black bg-orange-400 rounded-full w-[20px] h-[20px]"></div> // Medium Stock
                        ) : stock?.quantity >= 1 && stock?.quantity <= 30 ? (
                          <div className="border border-black bg-red-400 rounded-full w-[20px] h-[20px]"></div> // Low Stock
                        ) : stock?.quantity === 0 ? (
                          <div className="border border-black bg-gray-400 rounded-full w-[20px] h-[20px]"></div> // Out of Stock
                        ) : null}
                      </div>
                    </td>
                    <td>{formatPrice(stock?.shopPrice) + " PHP"}</td>
                    <td>{formatPrice(stock?.vatShopPrice) + " PHP"}</td>
                    <td>{formatPrice(stock?.vatToRemit) + " PHP"}</td>
                    <td>{stock?.vat?.vatPercent} %</td>
                    <td className="text-red-700">
                      {formatPrice(stock?.supplierPrice) + " PHP"}
                    </td>
                    <td className="text-red-700">
                      {formatPrice(stock?.shippingPrice) + " PHP"}
                    </td>
                    <td className="text-red-700">
                      {formatPrice(
                        stock?.supplierPrice * stock?.quantity +
                          stock?.shippingPrice
                      ) + " PHP"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm flex flex-col gap-2">
                      <button
                        disabled={currentUser.role === "validatorStaff"}
                        onClick={() => openSingleStockData(stock)}
                        className={`${
                          currentUser.role === "validatorStaff"
                            ? "hidden"
                            : "block"
                        } border border-black p-1 px-2 rounded-[5px] bg-green-700 text-white hover:text-indigo-300 mr-2`}
                      >
                        Order / Re-stock
                      </button>
                      <button
                        disabled={currentUser.role === "validatorStaff"}
                        onClick={() => openReduceModal(stock)}
                        className={`${
                          currentUser.role === "validatorStaff"
                            ? "hidden"
                            : "block"
                        } border border-black p-1 px-2 rounded-[5px] bg-red-700 text-white hover:text-indigo-300 mr-2`}
                      >
                        Reduce Quantity
                      </button>
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
