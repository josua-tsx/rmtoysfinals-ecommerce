import { useQuery } from "@tanstack/react-query";
import { CiEdit } from "react-icons/ci";
// import { MdDelete } from "react-icons/md";
import axiosInstance from "../../lib/axios";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";

import formatPrice from "../../reusable/formatPrice";

export default function AdminStocksTable() {
  // const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: stocks = [],
    isLoading: isStocksPending,
    isError: isStocksError,
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/get-stocks`);
      return res.data;
    },
  });

  console.log(stocks);

  const arrayStocks = Array.isArray(stocks) ? stocks : [];

  // const { mutate: deleteStockMutation } = useMutation({
  //   mutationFn: async (stockId) => {
  //     const res = await axiosInstance.delete(
  //       `/stocks/delete-stock/${stockId}`
  //     );
  //     return res.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["stocks"] });
  //     toast.success("Successfully Deleted");
  //   },
  //   onError: (err) => {
  //     toast.error(err.response.data.message || "something went wrong!");
  //   },
  // });

  const filteredArrayStocks = arrayStocks.filter(
    (stock) =>
      stock._id.includes(searchTerm) ||
      stock?.product?.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock?.supplier?.supplierName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock?.category?.categoryName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock?.stockQuantity
        .toString()
        .toLowerCase()
        .includes(searchTerm.toString().toLowerCase())
  );

  const navigateToEdit = (stockId) => {
    navigate(`/admin/editStocks/${stockId}`);
  };

  if (isStocksPending) {
    return <p>Loading...</p>;
  }

  if (isStocksError) {
    return <p>Something went wrong.</p>;
  }

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative">
      <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>
      <div className="border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between p-4">
        <h1>STOCKS TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="search stocks id, product name, supplier name, category name"
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto h-[600px] py-3">
        <table className="w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="font-normal p-2 pb-5">ID</th>
              <th className="font-normal p-2 pb-5">Product Name</th>
              <th className="font-normal p-2 pb-5">Supplier Name</th>
              <th className="font-normal p-2 pb-5">Category Name</th>
              <th className="font-normal p-2 pb-5">Quantity in Stock</th>
              <th className="font-normal p-2 pb-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 ">
            {filteredArrayStocks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No stocks available
                </td>
              </tr>
            ) : (
              filteredArrayStocks.map((stock) => (
                <tr key={stock._id}>
                  <td className="px-4">{stock._id}</td>
                  <td className="flex items-center gap-2">
                    <img
                      src={
                        stock?.product?.productImages[0] || "fallback-image-url"
                      } // Optional fallback
                      className="w-[30px]"
                      alt={stock.product.productName}
                    />
                    {stock.product.productName}
                  </td>
                  <td>{stock?.product.supplier?.supplierName}</td>
                  <td>{stock?.product?.category?.categoryName}</td>
                  <td>
                    <div className="flex gap-2 items-center w-[56px] justify-between">
                      <p>{formatPrice(stock?.stockQuantity)} </p>
                      {stock?.stockQuantity > 50 ? (
                        <div className="border border-black bg-green-400 rounded-full w-[20px] h-[20px]"></div> // High Stock
                      ) : stock?.stockQuantity > 30 &&
                        stock?.stockQuantity <= 50 ? (
                        <div className="border border-black bg-orange-400 rounded-full w-[20px] h-[20px]"></div> // Medium Stock
                      ) : stock?.stockQuantity >= 1 &&
                        stock?.stockQuantity <= 30 ? (
                        <div className="border border-black bg-red-400 rounded-full w-[20px] h-[20px]"></div> // Low Stock
                      ) : stock?.stockQuantity === 0 ? (
                        <div className="border border-black bg-gray-400 rounded-full w-[20px] h-[20px]"></div> // Out of Stock
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                    <button
                      onClick={() => navigateToEdit(stock._id)}
                      className="text-green-600 hover:text-indigo-300 mr-2"
                    >
                      <CiEdit size={25} />
                    </button>
                    {/* <button
                      onClick={() => deleteStockMutation(stock._id)}
                      className="text-red-600 hover:text-red-300"
                    >
                      <MdDelete size={25} />
                    </button> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
