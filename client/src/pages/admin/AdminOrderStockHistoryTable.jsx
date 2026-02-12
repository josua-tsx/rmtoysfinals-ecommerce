import { useState } from "react";
import formatPrice from "../../reusable/formatPrice";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

export default function AdminOrderStockHistoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isPending: isStockHistoryPending,
    isError: isStockHistoryError,
  } = useQuery({
    queryKey: ["stockHistory", page, debouncedSearch],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/history/get-stock-history?page=${page}&limit=${limit}&search=${debouncedSearch}`,
      );
      return res.data;
    },
  });

  const history = data?.history || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;
  const currentPage = data?.currentPage || 1;

  const columns = [
    {
      header: "Delivery ID",
      accessor: "deliveryId",
      className: "text-left font-mono text-black",
    },
    {
      header: "User",
      accessor: "userId",
      className: "text-center",
      render: (item) => item?.userId?.username || "—",
    },
    {
      header: "Action",
      accessor: "action",
      className: "text-center",
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded-[3px] border border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            item?.action === "admin_ordered_stock"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {item?.action?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Qty Ordered",
      accessor: "quantityOrdered",
      className: "text-center font-mono",
    },
    {
      header: "Supplier",
      accessor: "supplier",
      className: "text-left",
      render: (item) => item?.supplier?.supplierName || "—",
    },
    {
      header: "Sup. Price",
      accessor: "supplierPrice",
      className: "text-center font-mono",
      render: (item) => `${formatPrice(item?.supplierPrice)} PHP`,
    },
    {
      header: "Shipping",
      accessor: "shippingPrice",
      className: "text-center font-mono",
      render: (item) => `${formatPrice(item?.shippingPrice)} PHP`,
    },
    {
      header: "Shop Price",
      accessor: "shopPrice",
      className: "text-center font-mono",
      render: (item) => `${formatPrice(item?.shopPrice)} PHP`,
    },
    {
      header: "VAT %",
      accessor: "vatPercentApplied",
      className: "text-center font-mono",
    },
    {
      header: "Received Date",
      accessor: "receivedDate",
      className: "text-center",
      render: (item) => (
        <div className="flex flex-col">
          <span>{item?.receivedDate}</span>
          <span className="text-[10px] text-gray-400 font-mono">
            {new Date(item?.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      header: "Recv Qty",
      accessor: "receivedQuantity",
      className: "text-center font-mono",
    },
    {
      header: "Total Cost",
      accessor: "totalCost",
      className: "text-center font-mono font-bold text-red-600",
      render: (item) => `${formatPrice(item?.totalCost)} PHP`,
    },
  ];

  if (isStockHistoryError) return <p>Error.</p>;

  return (
    <ReusableTable
      title="Stock History"
      subtitle="Track all stock order and reorder activity"
      headerColor="bg-[#22c55e]"
      columns={columns}
      data={history}
      isLoading={isStockHistoryPending}
      search={{
        value: searchTerm,
        onChange: setSearchTerm,
        placeholder: "SEARCH BY DELIVERY ID, ACTION...",
      }}
      pagination={{
        currentPage: currentPage,
        totalPages: totalPages,
        totalItems: totalItems,
        onPageChange: setPage,
      }}
      emptyMessage="No stock history available"
    />
  );
}
