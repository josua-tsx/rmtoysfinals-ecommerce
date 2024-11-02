import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminAddCategory() {
  const queryClient = useQueryClient();

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
      toast.success("Category Added");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong");
    },
  });

  const handleCategorySubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const inputs = Object.fromEntries(formData);

    const { categoryName, categoryDescription } = inputs;

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
              <label htmlFor="" className="uppercase">
                Category Name:{" "}
              </label>
              <input
                type="text"
                name="categoryName"
                id="categoryName"
                className="border border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
            <div className="flex gap-2 flex-col">
              <label htmlFor="" className="uppercase">
                Category Description :{" "}
              </label>
              <textarea
                type="text"
                name="categoryDescription"
                id="categoryDescription"
                className="border resize-none border-black w-full rounded-[5px] p-1 h-[50p] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <button className="border bg-primary text-card rounded-b-[5px] uppercase p-2">
              Add Category
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
