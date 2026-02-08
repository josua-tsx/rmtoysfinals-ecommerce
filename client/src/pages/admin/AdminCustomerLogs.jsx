import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";
import { IoSearch } from "react-icons/io5";

const ACTION_TYPES = [
  "user_add_order",
  "newly_created_user",
  "user_added_review",
];

export default function AdminCustomerLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: customerLogs = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["customerLogs"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/audit/customer`);
      return res.data;
    },
  });

  const arrayCustomerLogs = Array.isArray(customerLogs) ? customerLogs : [];

  const filteredArrayCustomerLogs = arrayCustomerLogs.filter(
    (logs) =>
      logs.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      logs.targetId.includes(searchTerm),
  );

  if (isError) return <p>Error.</p>;

  return (
    <div className="font-main text-sm md:text-normal border rounded-[5px] border-black bg-card relative mt-8 overflow-visible">
      {/* Blue Sticker Header for Customer Logs */}
      <div className="absolute -top-4 -left-3 bg-[#2563eb] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black uppercase tracking-widest text-sm ">
          Customer Activity Feed
        </h1>
      </div>

      <div className="border-b border-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4 pt-8 bg-gray-50/50">
        <div className="hidden md:block">
          <p className="text-[11px] font-black uppercase text-gray-500 tracking-widest pl-1">
            Monitoring user engagement, orders, and feedback events
          </p>
        </div>
        <div className="flex items-center relative group w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="FILTER BY ACTIVITY OR USER ID..."
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
                  USER ACTION
                </th>
                <th className="px-4 py-4 text-left font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  ACTIVITY DETAILS
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest border-r border-black text-black">
                  CUSTOMER
                </th>
                <th className="px-4 py-4 text-center font-black text-[16px] uppercase tracking-widest text-black">
                  RANK
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[16px]">
              {filteredArrayCustomerLogs.length > 0 ? (
                filteredArrayCustomerLogs.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-4 py-4 border-r border-black font-mono text-black">
                      {new Date(customer.timestamp).toLocaleString()}
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <span
                        className={`px-3 py-1.5 rounded-[5px] border border-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] block w-fit mx-auto ${
                          ACTION_TYPES.includes(customer.action)
                            ? "bg-blue-100 text-blue-800"
                            : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {customer.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-4 py-4 border-r border-black">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black uppercase text-[9px] text-gray-500">
                            Target:
                          </span>
                          <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-dashed border-gray-300 font-bold text-black">
                            {customer.targetId}
                          </code>
                        </div>
                        <div className="bg-white border border-dashed border-gray-200 p-2 rounded-[5px] group-hover:border-black transition-colors">
                          <p className="whitespace-normal italic text-gray-600">
                            {customer.details?.description ||
                              "User performed a standard interface interaction"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 border-r border-black text-center">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[150px] text-black">
                          {customer.userId?.email || "GUEST_USER"}
                        </span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-tighter">
                          Verified Member
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span className="bg-white border border-black px-3 py-1 rounded-[5px] font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
                        {customer.role}
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
                    No customer activity logs recorded
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
