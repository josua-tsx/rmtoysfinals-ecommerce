import { useState } from "react";
import { createCategorySchema } from "../../schemas/category.schema";
import AdminCategoryTable from "../../components/admin/AdminCategoryTable";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import ValidatedInput from "../../reusable/ValidatedInput";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import FormModal from "../../reusable/FormModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminCategory() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [enableMultiDel, setEnableMultiDel] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      categoryName: "",
      categoryDescription: "",
    },
  });

  const { mutate: addCategoryMutation, isPending: isCategoryPending } =
    useMutation({
      mutationFn: async (data) => {
        const res = await axiosInstance.post(`/category/add-category`, data);
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        reset(); // Clear form
        toast.success("Category Added");
        setShowAdd(false);
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong");
      },
    });

  const onSubmit = (data) => {
    addCategoryMutation(data);
  };

  const toggleAddCategory = () => {
    setShowAdd(!showAdd);
    if (!showAdd) reset(); // Reset form when opening/closing if needed (optional)
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
          onSubmit={handleSubmit(onSubmit)}
          submitLabel="Add Category"
          isSubmitting={isCategoryPending || isSubmitting}
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
                id="categoryName"
                {...register("categoryName")}
                error={errors.categoryName}
                placeholder="Enter category name"
                required
                maxLength={50}
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
                id="categoryDescription"
                {...register("categoryDescription")}
                error={errors.categoryDescription}
                className="h-[100px]"
                placeholder="Enter category description"
                maxLength={200}
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
