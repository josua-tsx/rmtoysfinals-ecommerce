import { useState } from "react";
import AdminCategoryTable from "../../components/admin/AdminCategoryTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminAddCategory from "./AdminAddCategory";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";

export default function AdminCategory() {
  const [showAdd, setShowAdd] = useState(false);

  const [enableMultiDel, setEnableMultiDel] = useState(false);

  console.log(enableMultiDel)

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
  };

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"Category"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-16 flex-col">
        {/* main */}
        <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
          {/* <AdminStatCard title={"TOTAL PRODUCTS"} value={300}/>
        <AdminStatCard title={"TOTAL CATEGORIES"} value={5}/>
        <AdminStatCard title={"STOCKS"} value={300}/>
        <AdminStatCard title={"STOCKS"} value={300}/> */}
        </div>

        <div className="w-full  flex justify-start gap-2">
            
          <button
            onClick={toggleAddCategory}
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px]"
          >
            {showAdd ? "Cancel" : "Add Category"}
            <IoMdAdd />
          </button>

          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px]"
          >
            {
               enableMultiDel ? "Cancel Delete" : "Multiple delete"
            }
            <MdDelete />
          </button>

        </div>

        {showAdd && <AdminAddCategory />}

        <AdminCategoryTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
