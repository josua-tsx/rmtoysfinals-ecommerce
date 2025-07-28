import { useState } from "react";
import AdminSupplierTable from "../../components/admin/AdminSupplierTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminAddSupplier from "./AdminAddSupplier";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";

export default function AdminSupplier() {
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
  };

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"SUPPLIER"} />
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
            onClick={toggleAddCategory}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px]"
          >
            {showAdd ? "Cancel" : "Add Supplier"}
            <IoMdAdd />
          </button>

          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px]"
          >
            Multiple delete
            <MdDelete />
          </button>
        </div>

        {showAdd && <AdminAddSupplier />}

        <AdminSupplierTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
