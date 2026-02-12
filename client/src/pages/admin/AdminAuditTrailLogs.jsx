import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminAdminLogs from "./AdminAdminLogs";
import AdminCustomerLogs from "./AdminCustomerLogs";
import AdminValidatorStaffLogs from "./AdminValidatorStaffLogs";

export default function AdminAuditTrailLogs() {
  const [componenent, setComponent] = useState("admin");

  const handleSelectChange = (e) => {
    const changeComponent = e.target.value;
    setComponent(changeComponent);
  };

  return (
    <section className="bg-[#fffdf6] min-h-screen">
      <AdminHeader title={"AUDIT TRAIL LOGS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-6 flex-col">
        {/* Selection Area */}
        <div className="flex flex-col gap-1 max-w-sm">
          <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
            SELECT LOG CATEGORY
          </h2>
          <div className="relative group">
            <div className="absolute -inset-1 bg-black rounded-[5px] opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
            <select
              name="audit"
              id="audit"
              value={componenent}
              onChange={handleSelectChange}
              className="relative border border-black outline-none py-3 px-6 rounded-[5px] bg-white w-full md:w-[320px] font-black uppercase text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all cursor-pointer appearance-none pr-12"
            >
              <option value="admin">Admin logs</option>
              <option value="customer">Customer logs</option>
              <option value="validator">Validator logs</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="border-t-[6px] border-t-black border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent"></div>
            </div>
          </div>
        </div>

        {componenent === "admin" && <AdminAdminLogs />}
        {componenent === "customer" && <AdminCustomerLogs />}
        {componenent === "validator" && <AdminValidatorStaffLogs />}
      </div>
    </section>
  );
}
