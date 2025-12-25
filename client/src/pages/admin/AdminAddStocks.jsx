import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AdminAddStocks() {
  const [productId, setProductId] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [supplierPrice, setSupplierPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const navigate = useNavigate();

  const supplierTimesQuantity = supplierPrice * stockQuantity;
  const costOfTotal = Number(supplierTimesQuantity) + Number(shippingPrice);

  useEffect(() => {
    setTotalCost(costOfTotal);
  }, [costOfTotal]);

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

  const findProductThroughId = products.find(
    (product) => product._id === productId
  );

  console.log(findProductThroughId);

  const { mutate: addStocksMutation } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/stocks/add-stocks`, data);
      return res.data;
    },
    onSuccess: () => {
      setStockQuantity(0);
      setProductId("");
      toast.success("Successfully Added stock");
      // navigate(`/admin/stocks`)
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleSubmitForm = (e) => {
    e.preventDefault();

    addStocksMutation({
      productId,
      stockQuantity,
      supplierPrice,
      shippingPrice,
      totalCost,
    });
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

            {findProductThroughId ? (
              <>
                <div className="flex flex-col justify-between">
                  <label className="p-2 uppercase" htmlFor="supplierName">
                    Supplier Name:
                  </label>
                  <input
                    className="border p-1 w-full outline-none border-black rounded-[5px]"
                    type="text"
                    value={findProductThroughId.supplier?.supplierName || ""}
                    disabled
                  />
                </div>

                <div className="flex flex-col justify-between">
                  <label className="p-2 uppercase" htmlFor="categoryName">
                    Category Name:
                  </label>
                  <input
                    className="border p-1 w-full outline-none border-black rounded-[5px]"
                    type="text"
                    value={findProductThroughId.category?.categoryName || ""}
                    disabled
                  />
                </div>
              </>
            ) : null}

            <div className="flex flex-col justify-between">
              <label className="p-2 uppercase" htmlFor="stockQuantity">
                Stocks Quantity:{" "}
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

            <div className="flex flex-col justify-between">
              <label className="p-2 uppercase" htmlFor="stockQuantity">
                Supplier Price:{" "}
              </label>
              <input
                className="border p-1 w-full outline-none  border-black rounded-[5px]"
                type="number"
                min={0}
                name="supplierPrice"
                id="supplierPrice"
                value={supplierPrice}
                onChange={(e) => setSupplierPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col justify-between">
              <label className="p-2 uppercase" htmlFor="stockQuantity">
                Shipping Price:{" "}
              </label>
              <input
                className="border p-1 w-full outline-none  border-black rounded-[5px]"
                type="number"
                min={0}
                name="shippingPrice"
                id="shippingPrice"
                value={shippingPrice}
                onChange={(e) => setShippingPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col ">
              <label className="p-2 uppercase " htmlFor="stockQuantity">
                Total Cost ((unit price * stock quantity) + shipping price):{" "}
              </label>

              <input
                className="border p-1 w-full outline-none  border-black rounded-[5px]"
                type="number"
                min={0}
                name="totalCost"
                id="totalCost"
                value={totalCost}
                disabled
              />
            </div>
          </div>

          <div className="flex gap-2 p-2">
            <button
              type="submit"
              className="bg-primary flex-1 border border-black text-card p-2 rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Add Stocks
            </button>
            <button
              onClick={() => navigate(`/admin/stocks`)}
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
