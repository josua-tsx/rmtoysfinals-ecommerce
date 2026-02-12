import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import formatPrice from "../../reusable/formatPrice";
import AdminOrderRestockModal from "./AdminOrderRestockModal";
import ReduceQuantityModal from "../ReduceQuantityModal";
import { useUserStore } from "../../stores/useUserStore";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminStocksTable() {
  const currentUser = useUserStore((state) => state.currentUser);

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const [openModal, setOpenModal] = useState(false);
  const [reduceModal, setReduceModal] = useState(false);

  const [deliveryId, setDeliveryId] = useState(null);
  const [singleDataStock, setSingleDataStock] = useState();

  // Fetch Single Stock for Modals
  useQuery({
    queryKey: ["singleDeliveredProduct", deliveryId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/stocks/get-single-stock/${deliveryId}`,
      );
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

  const {
    data,
    isPending: isStocksPending,
    isError: isStocksError,
  } = useQuery({
    queryKey: ["stocks", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      const res = await axiosInstance.get(
        `/stocks/get-stocks?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const stocks = data?.stocks || [];
  const totalPages = data?.totalPages || 0;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  if (isStocksError) {
    return <p>Something went wrong loading stocks.</p>;
  }

  // Column Definitions
  const columns = [
    {
      header: "Delivery ID",
      className: "font-mono text-black text-left",
      accessor: "deliveryId",
    },
    {
      header: "Date",
      className: "text-left",
      render: (stock) => (
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-tighter text-gray-500">
            {new Date(stock?.dateDelivery).toLocaleDateString()}
          </span>
          <span className="text-[11px] font-mono text-gray-400">
            {new Date(stock?.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      header: "Product",
      className: "text-left",
      render: (stock) => (
        <div className="flex items-center gap-3">
          <img
            src={stock?.product?.productImages?.[0] || "fallback-image-url"}
            className="size-8 rounded-[3px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] object-cover bg-white"
            alt={stock?.product?.productName}
          />
          <span className="tracking-tight max-w-[150px] truncate text-black">
            {stock?.product?.productName}
          </span>
        </div>
      ),
    },
    {
      header: "Supplier",
      className: "text-gray-600 truncate max-w-[120px] text-left",
      accessor: "supplier.supplierName", // Using nested accessor if supported or render
      render: (stock) => stock?.supplier?.supplierName,
    },
    {
      header: "Category",
      className: "text-left",
      render: (stock) => (
        <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
          {stock?.product?.category?.categoryName}
        </span>
      ),
    },
    {
      header: "Stock",
      render: (stock) => (
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
      ),
    },
    {
      header: "S. Price",
      className: "font-mono font-bold text-center",
      render: (stock) => formatPrice(stock?.shopPrice),
    },
    {
      header: "W/ VAT",
      className: "font-mono font-bold text-center",
      render: (stock) => formatPrice(stock?.vatShopPrice),
    },
    {
      header: "Remit",
      className: "font-mono font-bold text-green-600 text-center",
      render: (stock) => formatPrice(stock?.vatToRemit),
    },
    {
      header: "VAT %",
      className: "font-mono font-bold text-center",
      render: (stock) => `${stock?.vat?.vatPercent || 0}%`,
    },
    {
      header: "Sup. P",
      className: "font-mono font-bold text-red-500 text-center",
      render: (stock) => formatPrice(stock?.supplierPrice),
    },
    {
      header: "Ship.",
      className: "font-mono font-bold text-red-500 text-center",
      render: (stock) => formatPrice(stock?.shippingPrice),
    },
    {
      header: "Total",
      className: "font-mono font-bold text-red-600 text-center",
      render: (stock) =>
        formatPrice(
          stock?.supplierPrice * stock?.quantity + stock?.shippingPrice,
        ),
    },
    {
      header: "Actions",
      render: (stock) => (
        <div className="flex flex-col gap-2 min-w-[120px]">
          <button
            disabled={currentUser.role === "validatorStaff"}
            onClick={() => openSingleStockData(stock)}
            className={`${
              currentUser.role === "validatorStaff" ? "hidden" : "block"
            } border border-black p-1.5 px-3 rounded-[5px] bg-[#22c55e] text-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50`}
          >
            Re-stock
          </button>
          <button
            disabled={currentUser.role === "validatorStaff"}
            onClick={() => openReduceModal(stock)}
            className={`${
              currentUser.role === "validatorStaff" ? "hidden" : "block"
            } border border-black p-1.5 px-3 rounded-[5px] bg-red-500 text-white font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50`}
          >
            Reduce
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {openModal && (
        <AdminOrderRestockModal
          singleStock={singleDataStock}
          onClose={closeSingleStockData}
        />
      )}

      {reduceModal && (
        <ReduceQuantityModal
          isOpen={reduceModal}
          singleStock={singleDataStock}
          onClose={closeReduceModal}
        />
      )}

      <ReusableTable
        title="Stocks Table"
        columns={columns}
        data={stocks}
        isLoading={isStocksPending}
        search={{
          value: localSearchTerm,
          onChange: setLocalSearchTerm,
          placeholder: "Ex: STK-001...",
        }}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          totalItems: totalItems,
          onPageChange: setPage,
        }}
        emptyMessage="No stocks available"
      />
    </>
  );
}
