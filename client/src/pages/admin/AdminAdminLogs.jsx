import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";

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
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: adminLogs = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/audit/admin`);
      return res.data;
    },
  });

  const arrayAdminLogs = Array.isArray(adminLogs) ? adminLogs : [];

  const filteredArrayAdminLogs = arrayAdminLogs.filter(
    (logs) =>
      logs.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      logs.targetId.includes(searchTerm),
  );

  if (isError) return <p>Error.</p>;

  return (
    <div className="font-main text-sm md:text-normal border rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Cyan Sticker Header for Admin Logs */}
      <div className="absolute -top-4 -left-3 bg-[#06b6d4] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          System Audit Feed
        </h1>
      </div>

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 pt-8 bg-gray-50/50">
        <div className="hidden md:block">
          <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
            Tracking administrative actions and system state changes
          </p>
        </div>
        <div className="flex items-center relative group w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="FILTER BY ACTION OR TARGET ID..."
            className="border border-black w-full md:w-[350px] rounded-[5px] py-2 pl-4 pr-10 focus:outline-none font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all placeholder:text-gray-300"
          />
          <IoSearch
            className="absolute right-3 text-black group-focus-within:scale-110 transition-transform"
            size={20}
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        {isPending ? (
          <div className="p-4">
            <AdminTableSkeleton />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-black">
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  TIMESTAMP
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  EVENT ACTION
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  DETAILS & CONTEXT
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  ADMINISTRATOR
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest text-black">
                  AUTHORITY
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest text-black">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredArrayAdminLogs.length > 0 ? (
                filteredArrayAdminLogs.map((admin) => (
                  <tr
                    key={admin._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-4 border-r border-black font-mono text-black">
                      {new Date(admin.timestamp).toLocaleString()}
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <span
                        className={`px-3 py-1.5 rounded-[5px] border border-black text-[13px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] block w-fit mx-auto ${
                          ACTION_TYPES.includes(admin.action)
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {admin.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-r border-black">
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
                                @{" "}
                                <span className="font-mono">
                                  ${admin.details.price}
                                </span>
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
                                <span className="text-black">
                                  {admin.details.quantity}
                                </span>{" "}
                                units to inventory
                              </p>
                            )}
                          {admin.action === "updated_product_stockQuantity" &&
                            admin.details?.quantity && (
                              <p className="text-indigo-600">
                                Inventory adjustment: set to{" "}
                                <span className="text-black">
                                  {admin.details.quantity}
                                </span>{" "}
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
                          {/* Fallback if no specific detail logic */}
                          {!admin.details && (
                            <p className="text-gray-400 italic">
                              No supplemental metadata available
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center font-black">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[150px] text-black">
                          {admin.userId?.email || "N/A"}
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-tighter">
                          System Administrator
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="bg-white border border-black px-3 py-1 rounded-[5px] font-black text-[13px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                        {admin.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-12 text-center text-gray-400 font-black uppercase tracking-widest text-xs"
                  >
                    No administrative audit logs found
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
