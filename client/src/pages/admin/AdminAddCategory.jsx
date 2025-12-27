import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { handleInputChange } from "../../reusable/helperFunctions/onChangeInput";

export default function AdminAddCategory() {
  const queryClient = useQueryClient();

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

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

  const handleClearButton = () => {
    setCategoryName("");
    setCategoryDescription("");
  };

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
    <form
      onSubmit={handleCategorySubmit}
      className="border flex flex-col gap-6 rounded-[5px] relative border-black bg-card p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-10"
    >
      <div className="absolute -top-6 -left-4 bg-primary border border-black text-white px-6 py-2 rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs transform -rotate-1">
        Add New Category
      </div>
      <div className="flex gap-4 p-2 flex-col">
        <div className="flex gap-3 flex-col">
          <label
            htmlFor=""
            className="font-black uppercase text-[10px] tracking-widest text-gray-500"
          >
            CATEGORY NAME
            <p className="normal-case font-medium pt-1 text-green-700">
              (No spaces/numbers allowed. 3-50 characters.)
            </p>
          </label>
          <input
            type="text"
            name="categoryName"
            id="categoryName"
            value={categoryName}
            maxLength={50}
            onChange={handleInputChange(setCategoryName)}
            className="border border-black w-full rounded-[5px] p-3 outline-none bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-3 flex-col mt-2">
          <label
            htmlFor=""
            className="font-black uppercase text-[10px] tracking-widest text-gray-500"
          >
            CATEGORY DESCRIPTION
            <p className="normal-case font-medium pt-1 text-green-700">
              (Max 200 characters.)
            </p>
          </label>
          <textarea
            name="categoryDescription"
            id="categoryDescription"
            value={categoryDescription}
            maxLength={200}
            onChange={handleInputChange(setCategoryDescription)}
            className="border resize-none border-black w-full rounded-[5px] p-3 h-[120px] outline-none bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 p-2 mt-2">
        <button className="border flex-1 border-black bg-primary !text-black rounded-[5px] py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95">
          {isCategoryPending ? "ADDING..." : "ADD CATEGORY"}
        </button>
        <button
          type="button"
          className="bg-red-600 md:w-[25%] border border-black rounded-[5px] text-white py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-widest text-xs hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:scale-95"
          onClick={handleClearButton}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
