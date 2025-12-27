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
        <div className="relative font-main max-w-sm">
          <label
            htmlFor="audit"
            className="font-black uppercase text-[10px] tracking-widest text-gray-500 mb-1 block ml-1"
          >
            SELECT LOG CATEGORY
          </label>
          <select
            name="audit"
            id="audit"
            value={componenent}
            onChange={handleSelectChange}
            className="border border-black outline-none p-3 rounded-[5px] bg-white w-full font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all cursor-pointer appearance-none"
          >
            <option value="admin">Admin logs</option>
            <option value="customer">Customer logs</option>
            <option value="validator">Validator logs</option>
          </select>
        </div>

        {componenent === "admin" && <AdminAdminLogs />}
        {componenent === "customer" && <AdminCustomerLogs />}
        {componenent === "validator" && <AdminValidatorStaffLogs />}
      </div>
    </section>
  );
}
