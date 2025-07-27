import { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminAddWorker from "./AdminAddWorker";
import AdminWorkersTable from "./AdminWorkersTable";
import { IoMdAdd } from "react-icons/io";

export default function AdminWorker() {
  const [showAdd, setShowAdd] = useState(false);

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
  };

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"WORKER TABLE"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* <AdminStatCard title={"TOTAL PRODUCTS"} value={98}/>
          <AdminStatCard title={"TOTAL CATEGORIES"} value={5}/>
          <AdminStatCard title={"STOCKS"} value={98}/>
          <AdminStatCard title={"SUPPLIERS"} value={5}/> */}
        </div>

        <div className="w-full  flex justify-end">
          <button
            onClick={toggleAddCategory}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px]"
          >
            {showAdd ? "Cancel" : "Add Worker"}
            <IoMdAdd />
          </button>
        </div>

        {showAdd && <AdminAddWorker />}


        <AdminWorkersTable />
      </div>
    </section>
  );
}
