import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdRestore } from "react-icons/md";
import axiosInstance from "../../../lib/axios";
import formatPrice from "../../../reusable/formatPrice";
import LoadingSpinner from "../../../reusable/LoadingSpinner";
import toast from "react-hot-toast";

export default function ArchivedProductsTable() {
  const queryClient = useQueryClient();

  const { data: products = [], isPending } = useQuery({
    queryKey: ["archivedProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/get-archived-products");
      return res.data;
    },
  });

  const { mutate: restoreProduct } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/product/restore-product/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring product"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this product?")) {
      restoreProduct(id);
    }
  };

  if (isPending) {
    return (
      <div className="flex justify-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b-2 border-black">
          <th className="p-4 font-black uppercase">Name</th>
          <th className="p-4 font-black uppercase">Price</th>
          <th className="p-4 font-black uppercase">Category</th>
          <th className="p-4 font-black uppercase">Supplier</th>
          <th className="p-4 font-black uppercase text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-black">
        {products.length > 0 ? (
          products.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="p-4 font-bold flex items-center gap-3">
                <img
                  src={item.productImages?.[0]}
                  alt=""
                  className="w-10 h-10 object-cover rounded border border-black"
                />
                {item.productName}
              </td>
              <td className="p-4 font-mono">{formatPrice(item.price)}</td>
              <td className="p-4">
                <span className="bg-white border border-black px-2 py-1 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs uppercase">
                  {item.category?.categoryName || "N/A"}
                </span>
              </td>
              <td className="p-4 text-sm">
                {item.supplier?.supplierName || "N/A"}
              </td>
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
              colSpan="5"
              className="p-8 text-center text-gray-500 uppercase tracking-widest font-bold"
            >
              No archived products found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
