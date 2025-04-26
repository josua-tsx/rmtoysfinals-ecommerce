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
    <section className="bg-yellow h-screen">
      <AdminHeader title={"LOGS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
          {/* CARD */}

          <select
            name="audit"
            id="audit"
            value={componenent}
            onChange={handleSelectChange}
            className="border border-black outline-none p-2 rounded-[5px] bg-card w-[300px]"
          >
            <option value="admin">Admin logs</option>
            <option value="customer">Customer logs</option>
            <option value="validator">Validator logs</option>
          </select>
        </div>

        {componenent === "admin" && <AdminAdminLogs />}
        {componenent === "customer" && <AdminCustomerLogs />}
        {componenent === "validator" && <AdminValidatorStaffLogs/>}
      </div>
    </section>
  );
}
