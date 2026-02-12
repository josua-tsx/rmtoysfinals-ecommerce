import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState, useEffect } from "react";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";

const ACTION_TYPES = [
  "create_product",
  "update_product",
  "draft_product",
  "published_addStock_product",
  "updated_product_stockQuantity",
  "create_supplier",
  "update_supplier",
  "create_category",
  "update_category",
  "create_gcashQR",
  "set_OrderStatus_delivered",
  "set_OrderStatus_Processing",
  "set_OrderStatus_Shipped",
  "set_OrderStatus_OutforDelivery",
  "admin_add_worker",
  "admin_edit_worker",
];

export default function AdminAdminLogs() {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data, isPending, isError } = useQuery({
    queryKey: ["adminLogs", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
      });
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      const res = await axiosInstance.get(`/audit/admin?${params.toString()}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const adminLogs = data?.logs || [];
  const totalPages = data?.pagination?.totalPages || 0;
  const totalItems = data?.pagination?.total || 0;
  const currentPage = data?.pagination?.page || 1;

  if (isError) return <p>Error loading admin logs.</p>;

  const columns = [
    {
      header: "TIMESTAMP",
      className:
        "px-4 py-4 border-r border-black font-mono text-black text-left",
      render: (row) => new Date(row.timestamp).toLocaleString(),
    },
    {
      header: "EVENT ACTION",
      className: "px-4 py-4 border-r border-black text-center text-black",
      render: (row) => (
        <span
          className={`px-3 py-1.5 rounded-[5px] border border-black text-[13px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] block w-fit mx-auto ${
            ACTION_TYPES.includes(row.action)
              ? "bg-emerald-100 text-emerald-800"
              : "bg-rose-100 text-rose-800"
          }`}
        >
          {row.action.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "DETAILS & CONTEXT",
      className: "px-4 py-4 border-r border-black text-left text-black",
      render: (admin) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black uppercase text-[12px] text-gray-500">
              Target:
            </span>
            <code className="text-[12px] bg-slate-100 px-2 py-0.5 rounded border border-dashed border-gray-300 font-bold text-black">
              {admin.targetId}
            </code>
          </div>
          <div className="bg-white border border-dashed border-gray-200 p-2 rounded-[5px] group-hover:border-black transition-colors">
            {/* Log Specific Details Rendering */}
            {admin.action === "create_product" &&
              admin.details?.productName && (
                <p className="text-indigo-600">
                  Created product:{" "}
                  <span className="text-black italic">
                    {admin.details.productName}
                  </span>{" "}
                  @ <span className="font-mono">${admin.details.price}</span>
                </p>
              )}
            {admin.action === "update_product" &&
              admin.details?.productName && (
                <p className="text-amber-600">
                  Updated product:{" "}
                  <span className="text-black italic">
                    {admin.details.productName}
                  </span>
                </p>
              )}
            {admin.action === "published_addStock_product" &&
              admin.details?.quantity && (
                <p className="text-emerald-600">
                  Publication & added{" "}
                  <span className="text-black">{admin.details.quantity}</span>{" "}
                  units to inventory
                </p>
              )}
            {admin.action === "updated_product_stockQuantity" &&
              admin.details?.quantity && (
                <p className="text-indigo-600">
                  Inventory adjustment: set to{" "}
                  <span className="text-black">{admin.details.quantity}</span>{" "}
                  units
                </p>
              )}
            {admin.action.includes("create_") &&
              admin.details &&
              !admin.details.productName && (
                <p className="text-emerald-600">
                  Created new{" "}
                  <span className="text-black italic">
                    {admin.action.split("_")[1]}
                  </span>{" "}
                  record
                </p>
              )}
            {admin.action.includes("set_OrderStatus") && (
              <p className="text-indigo-600">
                Status migration for order:{" "}
                <span className="text-black">
                  {admin.details?.email || "User"}
                </span>
              </p>
            )}
            {!admin.details && (
              <p className="text-gray-400 italic">
                No supplemental metadata available
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "ADMINISTRATOR",
      className: "px-4 py-4 border-r border-black text-center font-black",
      render: (row) => (
        <div className="flex flex-col">
          <span className="truncate max-w-[150px] text-black">
            {row.userId?.email || "N/A"}
          </span>
          <span className="text-[9px] text-gray-500 uppercase tracking-tighter">
            System Administrator
          </span>
        </div>
      ),
    },
    {
      header: "AUTHORITY",
      className: "px-4 py-4 text-center",
      render: (row) => (
        <span className="bg-white border border-black px-3 py-1 rounded-[5px] font-black text-[13px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
          {row.role}
        </span>
      ),
    },
  ];

  return (
    <ReusableTable
      title="System Audit Feed"
      subtitle="Tracking administrative actions and system state changes"
      headerColor="bg-[#06b6d4]"
      columns={columns}
      data={adminLogs}
      isLoading={isPending}
      search={{
        value: localSearchTerm,
        onChange: setLocalSearchTerm,
        placeholder: "FILTER BY ACTION OR TARGET ID...",
      }}
      pagination={{
        currentPage,
        totalPages,
        totalItems,
        onPageChange: setPage,
      }}
      emptyMessage="No administrative audit logs found"
    />
  );
}
