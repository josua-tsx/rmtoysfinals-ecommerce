import { useState } from "react";
import AdminCategoryTable from "../../components/admin/AdminCategoryTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminCategory() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  // Add Form State
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const { mutate: addCategoryMutation, isPending: isCategoryPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await axiosInstance.post(`/category/add-category`, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setCategoryDescription("");
        setCategoryName("");
        toast.success("Category Added");
        setShowAdd(false);
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong");
      },
    });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addCategoryMutation({ categoryName, categoryDescription });
  };

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
            className="border flex items-center justify-between gap-4 bg-primary text-white border-black p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Add Category
            <IoMdAdd />
          </button>

          <button
            onClick={() => setEnableMultiDel(!enableMultiDel)}
            className="border flex items-center justify-between gap-4 bg-red-700 text-white border-black p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {enableMultiDel ? "Cancel Delete" : "Multiple delete"}
            <MdDelete />
          </button>
        </div>

        {/* Add Category Modal */}
        <FormModal
          isOpen={showAdd}
          title="Add Category"
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddSubmit}
          submitLabel="Add Category"
          isSubmitting={isCategoryPending}
        >
          <div className="flex gap-2 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label htmlFor="categoryName" className="">
                CATEGORY NAME
                <p className="text-sm pt-1  text-green-700">
                  (Category name do not allow spaces and number. It should be
                  between 3 to 50 max characters.)
                </p>
              </label>
              <input
                type="text"
                name="categoryName"
                id="categoryName"
                value={categoryName}
                maxLength={50}
                onChange={handleInputChange(setCategoryName)}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
                required
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="categoryDescription" className="">
                CATEGORY DESCRIPTION :{" "}
                <p className="text-sm pt-1  text-green-700">
                  (Category description must not exceed to 200.)
                </p>
              </label>
              <textarea
                type="text"
                name="categoryDescription"
                id="categoryDescription"
                value={categoryDescription}
                maxLength={200}
                onChange={handleInputChange(setCategoryDescription)}
                className="border resize-none border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
          </div>
        </FormModal>

        <AdminCategoryTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
