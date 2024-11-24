import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminAdminLogs from "./AdminAdminLogs";
import AdminCustomerLogs from "./AdminCustomerLogs";

export default function AdminAuditTrailLogs() {
  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"AUDIT TRAIL LOGS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
          {/* CARD */}

          <select
            name="audit"
            id="audit"
            className="border border-black outline-none p-2 rounded-[5px] bg-card w-[300px]"
          >
            <option value="">Admin logs</option>
            <option value="">Customer logs</option>
          </select>
        </div>

        <AdminAdminLogs/>
        {/* <AdminCustomerLogs/> */}

      </div>
    </section>
  );
}
