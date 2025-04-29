import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminCategoryEdit() {
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();


  const [categoryName, setCategoryName] = useState("")
  const [categoryDescription, setCategoryDescription] = useState("")

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
      return res.data
    },
    enabled: !!params.editCategoryId,
  });

  useEffect(() => {
    if (singleCategory) {
        setCategoryName(singleCategory.categoryName)
        setCategoryDescription(singleCategory.categoryDescription)
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

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { categoryName, categoryDescription } = inputs;
    editCategoryMutation({ categoryName, categoryDescription });
  };

  const handleCancel = () => {
    navigate(`/admin/category`);
  };

  if (isSinglePending || isEditPending) {
    <p>loading...</p>;
  }
  if (isSingleError || isEditError) {
    <p>loading...</p>;
  }

  return (
    <section className="bg-yellow h-screen text-sm md:text-normal font-main">
      <AdminHeader title={"EDIT CATEGORY"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form
          onSubmit={handleEditSubmit}
          className="border flex flex-col gap-5  rounded-[5px] relative border-black bg-card"
        >
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className="flex gap-2 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="">
                CATEGORY NAME:{" "}
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
                onChange={handleInputChange(setCategoryName)}
                className="border border-black w-full rounded-[5px] p-1 h-[50px] outline-none"
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="">
                CATEGORY DESCRIPTION :{" "}
              </label>
              <textarea
                type="text"
                name="categoryDescription"
                id="categoryDescription"
                value={categoryDescription}
                onChange={handleInputChange(setCategoryDescription)}
                className="border resize-none border-black w-full rounded-[5px] p-1 h-[50px] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col p-2 gap-2 md:flex-row">
            <button className="flex-1 border border-black bg-primary text-card rounded-[5px]  p-2">
              Update Category
            </button>
            <button
              onClick={() => handleCancel()}
              type="button"
              className="bg-red-600 w-full p-2 md:w-[20%] border border-black rounded-[5px] text-card "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
