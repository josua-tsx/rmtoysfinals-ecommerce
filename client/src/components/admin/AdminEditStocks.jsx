import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";

export default function AdminEditStocks() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // const [newProductId, setNewProductId] = useState("");
  const [newStockQuantity, setNewStockQuantity] = useState(0);

  const {
    data: singleStock,
    isPending: isStockPending,
    isError: isStockError,
  } = useQuery({
    queryKey: ["stock"],
    queryFn: async () => {
      const { stockId } = params;
      const res = await axiosInstance.get(`/stocks/get-stock/${stockId}`);
      return res.data;
    },
    enabled: !!params.stockId,
  });

  const { mutate: editStockMutation } = useMutation({
    mutationFn: async (data) => {
      const { stockId } = params;
      const res = await axiosInstance.put(
        `/stocks/edit-stock/${stockId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Successfully Updated stock");
      navigate(`/admin/stocks`);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleEditStock = (e) => {
    e.preventDefault();
    editStockMutation({
      productId: singleStock.product._id,
      stockQuantity: newStockQuantity,
    });
  };

  const handleCancel = () => {
    navigate("/admin/stocks")
  }

  if (isStockPending) {
    return <p>loading...</p>;
  }
  if (isStockError ) {
    return <p>loading...</p>;
  }

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"EDIT STOCKS"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleEditStock}
          className="relative border border-black flex flex-col rounded-[5px] bg-card"
        >
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className="flex flex-col p-2 pb-5 gap-2">
            <div className="flex flex-col">
              <label className="p-2 uppercase" htmlFor="cproductName">
                Product:{" "}
              </label>
              <select
                className="w-full utline-none border border-black p-1 rounded-[5px]"
                name="productId"
                id="productId"
                value={singleStock.product.productName}
              >
                <option value="">Select Product</option>
                      <option value={singleStock.product.productName}>
                      {singleStock.product.productName}
                      </option>
                  
              </select>
            </div>

            <div className="flex flex-col justify-between">
             <div className="flex gap-2 items-center">
             <label className="p-2 uppercase" htmlFor="stockQuantity">
                Stock Quantity:{" "}
              </label>
              <p className="text-indigo-700">CURRENT STOCK: {singleStock.stockQuantity}</p>
             </div>
              <input
                className="border p-1 w-full outline-none  border-black rounded-[5px]"
                type="number"
                min={0}
                name="stockQuantity"
                id="stockQuantity"
                value={newStockQuantity}
                onChange={(e) => setNewStockQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="flex p-2 gap-2">
            <button
              type="submit"
              className="bg-primary flex-1 border border-black text-card p-2 rounded-[5px]"
            >
              Update Stocks
            </button>
            <button onClick={() => handleCancel()}
            type="button" className="bg-red-600 w-[20%] border border-black rounded-[5px] text-card ">Cancel</button>

          </div>
        </form>
      </div>
    </section>
  );
}
