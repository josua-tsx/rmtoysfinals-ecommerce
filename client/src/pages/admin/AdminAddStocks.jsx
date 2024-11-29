import { useState } from "react";
import axiosInstance from "../../lib/axios";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function AdminAddStocks() {
  const [productId, setProductId] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);

  const {
    data: products = [],
    isPending: isProductsPending,
    isError: isProductsError,
  } = useQuery({
    queryKey: ["noStockProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-nostockProducts`);
      return res.data;
    },
  });


  const { mutate: addStocksMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/stocks/add-stocks`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Successfully Added stock");
      setStockQuantity(0)
      setProductId("")
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleSubmitForm = (e) => {
    e.preventDefault();

    addStocksMutation({ productId, stockQuantity });
  };

  if (isProductsPending) {
    return <p>loading...</p>;
  }
  if (isProductsError) {
    return <p>loading...</p>;
  }

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"ADD STOCKS"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <form
          onSubmit={handleSubmitForm}
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
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Select Product</option>
                {products.length > 0 &&
                  products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.productName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col justify-between">
              <label className="p-2 uppercase" htmlFor="stockQuantity">
                Stock Quantity:{" "}
              </label>
              <input
                className="border p-1 w-full outline-none  border-black rounded-[5px]"
                type="number"
                min={0}
                name="stockQuantity"
                id="stockQuantity"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
          </div>

         <div className="flex p-2">
         <button
            type="submit"
            className="bg-primary flex-1 border border-black text-card p-2 rounded-[5px]"
          >
            Add Stocks
          </button>
         </div>
        </form>
      </div>
    </section>
  );
}
