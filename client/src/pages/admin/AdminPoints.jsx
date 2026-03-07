import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminPointsTable from "./AdminPointsTable";

export default function AdminPoints() {
  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"CREDIT POINTS OPTIONS"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Manage credit points choices available for products.
            </p>
          </div>
        </div>

        <AdminPointsTable />
      </div>
    </section>
  );
}
