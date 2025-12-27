import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminProductReviewsTable from "../../components/admin/AdminProductReviewsTable";

export default function AdminProductReviews() {
  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"Product Reviews Management"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-8 flex-col px-4">
        {/* Info Area */}
        <div className="flex flex-col gap-1">
          <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
            Community Feedback
          </h2>
          <div className="flex items-center gap-3 bg-white border border-black p-4 rounded-[5px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-fit flex-nowrap">
            <div className="size-4 bg-indigo-600 border border-black rounded-full animate-pulse"></div>
            <p className="font-black uppercase text-sm italic text-black">
              Monitoring and validating customer product experiences
            </p>
          </div>
        </div>

        {/* Detailed Reviews Table */}
        <div className="transition-all duration-300">
          <AdminProductReviewsTable />
        </div>
      </div>
    </section>
  );
}
