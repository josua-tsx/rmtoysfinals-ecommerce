import AdminHeader from "../../reusable/Admin/AdminHeader";
import { MdDelete } from "react-icons/md";
import AdminFaqsTable from "./AdminFaqsTable";
import { useState } from "react";
import AdminAddFaqs from "./AdminAddFaqs";
import { IoMdAdd } from "react-icons/io";

export default function AdminFaqs() {
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"FAQS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* CARD */}
          {/* <AdminStatCard title={"TOTAL PRODUCTS"} value={300}/>
            <AdminStatCard title={"TOTAL CATEGORIES"} value={5}/>
            <AdminStatCard title={"STOCKS"} value={300}/>
            <AdminStatCard title={"STOCKS"} value={300}/> */}
        </div>

        <div className="w-full  flex gap-2">
          <button
            onClick={() => setShowAdd((e) => !e)}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px]"
          >
            {showAdd ? "Cancel" : "Add Faq"}
            <IoMdAdd />
          </button>

          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px]"
          >
            {
              enableMultiDel ? "Cancel Delete": "Multiple Delete"
            }
            <MdDelete />
          </button>
        </div>

        {showAdd && <AdminAddFaqs />}

        <AdminFaqsTable enableMultiDel={enableMultiDel} />
      </div>

      
    </section>
  );
}
