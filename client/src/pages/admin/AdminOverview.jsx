import AdminProductOverview from "../../components/admin/AdminProductOverview";
import AdminSalesOverview from "../../components/admin/AdminSalesOverview";
import AdminHeader from "../../reusable/Admin/AdminHeader";

export default function AdminOverview() {
  return (
    <section className="bg-yellow h-screen ">
      <AdminHeader title={"Overview"} />
      <div className="max-w-[90%] py-14 mx-auto flex gap-10 flex-col">
        <div className="flex relative">
          {/* <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <select
            name=""
            id=""
            className="border w-[280px] border-black p-2 rounded-[5px] outline-none"
          >
            <option value="">SALES OVERVIEW</option>
          </select> */}
        </div>

        <AdminSalesOverview />
        <AdminProductOverview/>

     

      </div>
    </section>
  );
}
