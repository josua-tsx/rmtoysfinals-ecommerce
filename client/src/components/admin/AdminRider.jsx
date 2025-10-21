import React, { useState } from "react";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminRiderTable from "../../pages/admin/AdminRiderTable";
import { IoMdAdd } from "react-icons/io";
import AdminAddWorker from "../../pages/admin/AdminAddWorker";
import AdminAddRider from "./AdminAddRider";
import { MdDelete } from "react-icons/md";

export default function AdminRider() {
  const [showAdd, setShowAdd] = useState(false);

  const [enableMultiDel, setEnableMultiDel] = useState(false);

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"RIDER TABLE"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* <AdminStatCard title={"TOTAL PRODUCTS"} value={98}/>
              <AdminStatCard title={"TOTAL CATEGORIES"} value={5}/>
              <AdminStatCard title={"STOCKS"} value={98}/>
              <AdminStatCard title={"SUPPLIERS"} value={5}/> */}
        </div>

        <div className="w-full gap-2  flex ">
          <button
            onClick={() => setShowAdd((prev) => !prev)}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px]"
          >
            {showAdd ? "Cancel" : "Add Rider"}
            <IoMdAdd />
          </button>
          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px]"
          >
            {
              enableMultiDel ? "Cancel Delete" : "Multiple Delete"
            }
            <MdDelete />
          </button>
        </div>

        {showAdd && <AdminAddRider />}

        <AdminRiderTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
