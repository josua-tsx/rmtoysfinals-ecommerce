import { useState } from "react";
import AdminProductsTable from "../../components/admin/AdminProductsTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { MdDelete } from "react-icons/md";

export default function AdminProducts() {
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"PRODUCTS"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setEnableMultiDel(!enableMultiDel)}
                className={`flex items-center gap-3 border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group ${
                  enableMultiDel
                    ? "bg-red-500 text-white"
                    : "bg-white text-black"
                }`}
              >
                {enableMultiDel ? "STOP DELETE" : "BATCH DELETE"}
                <MdDelete
                  className={`text-xl ${enableMultiDel ? "" : "text-red-600"}`}
                />
              </button>
            </div>
          </div>
        </div>

        <AdminProductsTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
