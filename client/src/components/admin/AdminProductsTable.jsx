import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import formatPrice from "../../reusable/formatPrice";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminProductsTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: products = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-products`);
      return res.data;
    },
  });

  const productArray = Array.isArray(products.products)
    ? products.products
    : [];

  const { mutate: addToSlider } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.put(
        `/product/add-to-slider/${productId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Succesfully updated!");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const { mutate: deleteProductMutation } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.delete(
        `/product/delete-product/${productId}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Successfully Deleted");
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const handleDeleteClick = (productId) => {
    setDeleteProductId(productId); 
    setIsConfirmModalOpen(true); 
  };

  const confirmDelete = () => {
    if (deleteProductId) {
      deleteProductMutation(deleteProductId); 
      cancelDelete()
    }
  };

  const cancelDelete = () => {
    setDeleteProductId(null); 
    setIsConfirmModalOpen(false); 
  };

  const filteredProducts = productArray.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id.includes(searchTerm)
  );

  const navigateToeditPage = (editId) => {
    navigate(`/admin/editProduct/${editId}`);
  };

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error loading filters</p>;

  return (
    <div className="font-main border rounded-[5px] border-black bg-card relative ">
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className=" border flex-col border-b-black rounded-t-[5px] flex md:flex-row items-center justify-between  p-4">
        <h1>PRODUCTS TABLE</h1>
        <div className="flex items-center relative">
          <input
            type="text"
            placeholder="search products.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border md:w-[300px] border-black rounded-[5px] p-1 focus:outline-none"
          />
          <IoSearch className="absolute right-0" size={30} />
        </div>
      </div>
      <div className="overflow-y-auto  h-[600px] py-3">
        {
          isPending ? (
            <div className="flex h-full justify-center items-center"><LoadingSpinner/></div>
          ) : (
            <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr className="">
                <th className="font-normal p-2 pb-5">ID</th>
                <th className="font-normal p-2 pb-5">NAME</th>
                <th className="font-normal p-2 pb-5">CATEGORY</th>
                <th className="font-normal p-2 pb-5">PRICE</th>
                <th className="font-normal p-2 pb-5">STATUS</th>
                <th className="font-normal p-2 pb-5">REVIEWS</th>
                <th className="font-normal p-2 pb-5">SOLD</th>
                <th className="font-normal p-2 pb-5">DISCOUNT</th>
                <th className="font-normal p-2 pb-5">POINTS</th>
                <th className="font-normal p-2 pb-5">DATE CREATED</th>
                {/* <th className="font-normal p-2 pb-5">Stocks</th> */}
                <th className="font-normal p-2 pb-5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 ">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-4 ">{product._id}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm truncate font-medium flex items-center gap-2	">
                      <img
                        src={product.productImages[0]}
                        alt="Product img"
                        className="size-10 rounded-full"
                      />
                      {product.productName}
                    </td>
  
                    <td className="px-4 py-4 uppercase whitespace-nowrap text-center text-sm">
                      {product.category && product.category.categoryName}
                    </td>
  
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {formatPrice(product?.price)} PHP
                    </td>
  
                    <td className="px-6 py-4 text-indigo-700 uppercase whitespace-nowrap text-center text-sm">
                      {product.status}
                    </td>
  
                    <td className="px-6 py-4 text-indigo-700 uppercase whitespace-nowrap text-center text-sm">
                      {product?.reviews?.length}
                    </td>
  
                    <td className="px-6 py-4 text-indigo-700 uppercase whitespace-nowrap text-center text-sm">
                      {product?.sold}
                    </td>
  
                    <td className="px-6 py-4 text-indigo-700 uppercase whitespace-nowrap text-center text-sm">
                      {product?.discount
                        ? formatPrice(product?.discount) 
                        : "no discount"}
                    </td>
  
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {product?.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {new Date(product.createdAt).toLocaleString()}
                    </td>
  
                    {/* <td className="px-4 py-4 whitespace-nowrap text-cener text-sm">
                    {product.stocks}
                  </td> */}
                    <td className="px-4 py-4 whitespace-nowrap gap-3 text-sm flex justify-center">
                      <button
                        onClick={() => navigateToeditPage(product._id)}
                        className="text-green-600 hover:text-indigo-300 mr-2"
                      >
                        <CiEdit size={25} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product._id)}
                        className="text-red-600 hover:text-red-300"
                      >
                        <MdDelete size={25} />
                      </button>
                      <button
                        onClick={() => addToSlider(product._id)}
                        className="text-red-600 hover:text-red-300"
                      >
                        {!product?.isBestProduct
                          ? "ADD TO SLIDER"
                          : "REMOVE FROM SLIDER"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <p className="px-1">no products</p>
              )}
            </tbody>
          </table>
          )
        }
      </div>
    </div>
  );
}
