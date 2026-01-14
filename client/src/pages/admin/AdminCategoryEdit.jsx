import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategorySchema,
  categoryNameSchema,
  categoryDescriptionSchema,
} from "../../schemas/category.schema";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import ValidatedInput from "../../reusable/ValidatedInput";
import axiosInstance from "../../lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminCategoryEdit() {
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const {
    data: singleCategory,
    isPending: isSinglePending,
    isError: isSingleError,
  } = useQuery({
    queryKey: ["categories", params.editCategoryId],
    queryFn: async () => {
      const { editCategoryId } = params;
      const res = await axiosInstance.get(
        `/category/get-single/${editCategoryId}`
      );
      return res.data;
    },
    enabled: !!params.editCategoryId,
  });

  useEffect(() => {
    if (singleCategory) {
      setCategoryName(singleCategory.categoryName);
      setCategoryDescription(singleCategory.categoryDescription);
    }
  }, [singleCategory]);

  const {
    mutate: editCategoryMutation,
    isPending: isEditPending,
    isError: isEditError,
  } = useMutation({
    mutationFn: async (data) => {
      const { editCategoryId } = params;
      const res = await axiosInstance.put(
        `/category/edit-category/${editCategoryId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Successfully Edited!");
      navigate(`/admin/category`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const data = { categoryName, categoryDescription };
    const result = createCategorySchema.safeParse(data);

    if (!result.success) {
      return toast.error(result.error.issues[0].message);
    }

    editCategoryMutation(result.data);
  };

  const handleCancel = () => {
    navigate(`/admin/category`);
  };

  if (isSinglePending || isEditPending) {
    return (
      <div className="bg-yellow h-screen flex items-center justify-center font-main">
        <p className="font-black uppercase tracking-widest animate-pulse">
          Loading Category...
        </p>
      </div>
    );
  }
  if (isSingleError || isEditError) {
    return (
      <div className="bg-yellow h-screen flex items-center justify-center font-main">
        <p className="font-black uppercase tracking-widest text-red-600">
          Error loading category.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-yellow min-h-screen text-sm md:text-normal font-main pb-20">
      <AdminHeader title={"EDIT CATEGORY"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form
          onSubmit={handleEditSubmit}
          className="border flex flex-col gap-6 p-6 rounded-[5px] relative border-black bg-card shadow-lg"
        >
          <div className="absolute bg-[#22c55e] -top-3 -left-3 px-4 py-1 border border-black rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-white font-black uppercase text-[10px] tracking-widest italic">
              CATEGORY DETAILS
            </h2>
          </div>

          <div className="flex gap-6 flex-col">
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
                className="h-[120px] leading-relaxed"
                placeholder="Enter category description"
              />
              <p className="text-[10px] pt-1 text-gray-500 uppercase tracking-tight">
                (Max 200 characters allowed.)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row mt-2">
            <button className="flex-1 bg-[#22c55e] text-white p-4 flex justify-center items-center rounded-[5px] border border-black font-black uppercase tracking-[0.1em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              Update Category
            </button>
            <button
              onClick={handleCancel}
              type="button"
              className="bg-[#ef4444] text-white p-4 md:w-[20%] border border-black rounded-[5px] font-black uppercase tracking-[0.1em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
