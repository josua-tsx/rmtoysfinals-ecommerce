import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axios";
import { useQuery } from "@tanstack/react-query";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

const ACTION_TYPES = [
  "set_OrderStatus_delivered",
  "set_OrderStatus_Processing",
  "set_OrderStatus_Shipped",
  "set_OrderStatus_OutforDelivery",
  "set_OrderStatus_Cancelled",

  "set_PaymentStatus_Failed",
];

export default function AdminValidatorStaffLogs() {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["validatorStaff", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      const res = await axiosInstance.get(
        `/audit/validatorStaff?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const validatorStaff = data?.logs || [];
  const totalPages = data?.pagination?.totalPages || 0;
  const totalItems = data?.pagination?.total || 0;
  const currentPage = data?.pagination?.page || 1;

  if (isError) return <p>Error loading validator logs.</p>;

  const columns = [
    {
      header: "TIMESTAMP",
      className:
        "px-4 py-4 border-r border-black font-mono text-black text-left",
      render: (row) => new Date(row.timestamp).toLocaleString(),
    },
    {
      header: "VAL. ACTION",
      className: "px-4 py-4 border-r border-black text-center text-black",
      render: (row) => (
        <span
          className={`px-3 py-1.5 rounded-[5px] border border-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] block w-fit mx-auto ${
            ACTION_TYPES.includes(row.action)
              ? "bg-amber-100 text-amber-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {row.action.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "VALIDATION CONTEXT",
      className: "px-4 py-4 border-r border-black text-left text-black",
      render: (admin) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black uppercase text-[9px] text-gray-500">
              Target ID:
            </span>
            <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-dashed border-gray-300 font-bold text-black">
              {admin.targetId}
            </code>
          </div>
          <div className="bg-white border border-dashed border-gray-200 p-2 rounded-[5px] group-hover:border-black transition-colors">
            <p className="whitespace-normal italic text-gray-600">
              {admin.details?.email
                ? `Verification processed for: ${admin.details.email}`
                : "Standard fulfillment validation event"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "VALIDATOR",
      className: "px-4 py-4 border-r border-black text-center font-black",
      render: (row) => (
        <div className="flex flex-col">
          <span className="truncate max-w-[150px] text-black">
            {row.userId?.email || "OFFLINE_VAL"}
          </span>
          <span className="text-[9px] text-gray-500 uppercase tracking-tighter">
            Certified Validator
          </span>
        </div>
      ),
    },
    {
      header: "POSITION",
      className: "px-4 py-4 text-center",
      render: (row) => (
        <span className="bg-white border border-black px-3 py-1 rounded-[5px] font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
          {row.role}
        </span>
      ),
    },
  ];

  return (
    <ReusableTable
      title="Verification Audit Feed"
      subtitle="Validating integrity of order status migrations and fulfillment events"
      headerColor="bg-[#f59e0b]"
      columns={columns}
      data={validatorStaff}
      isLoading={isPending}
      search={{
        value: localSearchTerm,
        onChange: setLocalSearchTerm,
        placeholder: "FILTER BY VALIDATION ACTION...",
      }}
      pagination={{
        currentPage,
        totalPages,
        totalItems,
        onPageChange: setPage,
      }}
      emptyMessage="No validation staff audit logs found"
    />
  );
}
