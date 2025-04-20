import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";
import { useNavigate } from "react-router-dom";

export default function AdminAddCategory() {
  const queryClient = useQueryClient();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const navigate = useNavigate()

  const {
    mutate: addCategoryMutation,
    isPending: isCategoryPending,
    isError: isCategoryError,
  } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/category/add-category`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryDescription("");
      setCategoryName("");
      toast.success("Category Added");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const handleCategorySubmit = (e) => {
    e.preventDefault();

    try {
      addCategoryMutation({ categoryName, categoryDescription });
      e.target.reset();
    } catch (error) {
      console.log(error);
    }
  };

  if (isCategoryPending) {
    <p>loading....</p>;
  }

  if (isCategoryError) {
    <p>loading....</p>;
  }

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"ADD NEW CATEGORY"} />

      <div className="max-w-[90%]  pt-14 pb-5 mx-auto flex gap-5 flex-col relative">
        <form
          onSubmit={handleCategorySubmit}
          className="border flex flex-col gap-5  rounded-[5px] relative border-black bg-card"
        >
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className="flex gap-2 p-2 flex-col">
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="">
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
                onChange={handleInputChange(setCategoryName)}
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="">
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
                onChange={handleInputChange(setCategoryDescription)}
                className="border resize-none border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
          </div>

          <div className="flex  gap-2 p-2">
            <button className="border flex-1 border-black bg-primary text-card rounded-[5px] uppercase p-2">
              Add Category
            </button>
            <button
                onClick={() => navigate(`/admin/category`)}
                type="button"
                className="bg-red-600 w-[20%] border border-black rounded-[5px] text-card "
              >
                Cancel
              </button>
          </div>
        </form>
      </div>
    </section>
  );
}
