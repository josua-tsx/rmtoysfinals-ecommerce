import { useState } from "react";
import {
  createCategorySchema,
  categoryNameSchema,
  categoryDescriptionSchema,
} from "../../schemas/category.schema";
import AdminCategoryTable from "../../components/admin/AdminCategoryTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import ValidatedInput from "../../reusable/ValidatedInput";
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

    const data = { categoryName, categoryDescription };
    const result = createCategorySchema.safeParse(data);

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    addCategoryMutation(result.data);
  };

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
  };

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20">
      <AdminHeader title={"Category"} />
      <div className="max-w-[95%] pt-10 mx-auto flex gap-10 flex-col px-4">
        {/* Actions Area */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-dashed border-gray-300 pb-8">
          <div className="flex flex-col gap-1">
            <h2 className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-500 pl-1">
              Data Management
            </h2>
            <div className="flex gap-4">
              <button
                onClick={toggleAddCategory}
                className="flex items-center gap-3 bg-indigo-600 text-white border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group"
              >
                {showAdd ? "CANCEL ADD" : "ADD CATEGORY"}
                <IoMdAdd
                  className={`text-xl transition-transform ${
                    showAdd ? "rotate-45" : "group-hover:scale-125"
                  }`}
                />
              </button>

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

        {/* Add Category Modal */}
        <FormModal
          isOpen={showAdd}
          title="Add Category"
          onClose={() => setShowAdd(false)}
          onSubmit={handleAddSubmit}
          submitLabel="Add Category"
          isSubmitting={isCategoryPending}
        >
          <div className="flex gap-4 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label
                htmlFor="categoryName"
                className="font-black uppercase text-xs tracking-widest pl-1"
              >
                CATEGORY NAME
              </label>
              <ValidatedInput
                name="categoryName"
                value={categoryName}
                onChange={handleInputChange(setCategoryName)}
                schema={categoryNameSchema}
                placeholder="Enter category name"
                required
              />
              <p className="text-[10px] pt-1 text-gray-500 uppercase tracking-tight">
                (Name should be 3-50 chars. Only letters, numbers and single
                spaces allowed.)
              </p>
            </div>
            <div className="flex gap-2 flex-col">
              <label
                htmlFor="categoryDescription"
                className="font-black uppercase text-xs tracking-widest pl-1"
              >
                CATEGORY DESCRIPTION
              </label>
              <ValidatedInput
                type="textarea"
                name="categoryDescription"
                value={categoryDescription}
                onChange={handleInputChange(setCategoryDescription)}
                schema={categoryDescriptionSchema}
                className="h-[100px]"
                placeholder="Enter category description"
              />
              <p className="text-[10px] pt-1 text-gray-500 uppercase tracking-tight">
                (Max 200 characters allowed.)
              </p>
            </div>
          </div>
        </FormModal>

        <AdminCategoryTable enableMultiDel={enableMultiDel} />
      </div>
    </section>
  );
}
