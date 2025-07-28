import { useState } from "react";
import AdminProductsTable from "../../components/admin/AdminProductsTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { MdDelete } from "react-icons/md";

export default function AdminProducts() {
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"PRODUCTS"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
          {/* CARD */}
        </div>

        <div className="w-full  flex gap-2">
          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px]"
          >
            Multiple delete
            <MdDelete />
          </button>
        </div>

        <AdminProductsTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
