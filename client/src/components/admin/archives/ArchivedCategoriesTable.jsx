import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdRestore } from "react-icons/md";
import axiosInstance from "../../../lib/axios";
import AdminTableSkeleton from "../../skeleton/AdminTableSkeleton";
import toast from "react-hot-toast";

export default function ArchivedCategoriesTable() {
  const queryClient = useQueryClient();

  const { data: categories = [], isPending } = useQuery({
    queryKey: ["archivedCategories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/category/get-archived-categories");
      return res.data;
    },
  });

  const { mutate: restoreCategory } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/category/restore-category/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedCategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring category"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this category?")) {
      restoreCategory(id);
    }
  };

  if (isPending) {
    return (
      <div className="p-4">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b-2 border-black">
          <th className="p-4 font-black uppercase">Name</th>
          <th className="p-4 font-black uppercase text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-black">
        {categories.length > 0 ? (
          categories.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="p-4 font-bold">{item.categoryName}</td>
              <td className="p-4 text-center">
                <button
                  onClick={() => handleRestore(item._id)}
                  className="bg-green-500 text-white p-2 rounded border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                  title="Restore"
                >
                  <MdRestore size={20} />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="2"
              className="p-8 text-center text-gray-500 uppercase tracking-widest font-bold"
            >
              No archived categories found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
