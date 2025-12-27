import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminOrderStatusTable from "./AdminOrderStatusTable";
import AdminOrderGuestStatus from "./AdminOrderGuestStatus";

export default function AdminOrderStatus() {
  const [selectedComponent, setSelectedComponent] = useState("user");

  const handleChangeComponent = (e) => {
    const componentChange = e.target.value;
    setSelectedComponent(componentChange);
  };

  console.log(selectedComponent);

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"ORDER STATUS"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-5 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* Decorative element removed or updated to match clean retro */}
          {/* <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div> */}
          {/* CARD */}
        </div>
        <div className="relative group w-full md:w-[320px]">
          <select
            name=""
            id=""
            value={selectedComponent}
            onChange={handleChangeComponent}
            className="relative border border-black outline-none py-3 px-6 rounded-[5px] bg-white w-full font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all cursor-pointer appearance-none pr-12"
          >
            <option value="user">User Order</option>
            <option value="guest">Guest Order</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="border-t-[6px] border-t-black border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent"></div>
          </div>
        </div>

        {selectedComponent === "user" && <AdminOrderStatusTable />}

        {selectedComponent === "guest" && <AdminOrderGuestStatus />}
      </div>
    </section>
  );
}
