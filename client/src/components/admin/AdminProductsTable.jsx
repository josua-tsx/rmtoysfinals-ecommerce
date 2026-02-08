import { IoSearch } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import formatPrice from "../../reusable/formatPrice";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";

export default function AdminProductsTable({ enableMultiDel }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

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

  // --- ADD THESE LINES ---
  const numSelected = selectedIds.length;
  const numProducts = productArray.length;

  // Checkbox is ticked only if all products are selected
  const allSelected = numProducts > 0 && numSelected === numProducts;

  const { mutate: addToSlider } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.put(
        `/product/add-to-slider/${productId}`,
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
        `/product/delete-product/${productId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Successfully Deleted");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong!");
    },
  });

  const { mutate: deleteMultiProd } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/product/delete-multi-prod`, {
        productIds: data,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Products are deleted successfully!");
      setSelectedIds([]);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });

  useEffect(() => {
    if (!enableMultiDel) {
      setSelectedIds([]);
    }
  }, [enableMultiDel]);

  const handleDeleteClick = (productId) => {
    setDeleteProductId(productId);
    setIsConfirmModalOpen(true);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(productArray.map((product) => product._id));
    }
  };

  const confirmDelete = () => {
    if (deleteProductId) {
      deleteProductMutation(deleteProductId);
      cancelDelete();
    }
  };

  const cancelDelete = () => {
    setDeleteProductId(null);
    setIsConfirmModalOpen(false);
  };

  const pushMultipleProd = (productIds) => {
    setSelectedIds((prev) =>
      prev.includes(productIds)
        ? prev.filter((id) => id !== productIds)
        : [...prev, productIds],
    );
  };

  const cancelMultiDel = () => {
    setSelectedIds([]);
  };

  const handleMultiDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one product to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} products?`,
      )
    ) {
      deleteMultiProd(selectedIds);
    }
  };

  const filteredProducts = productArray.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id.includes(searchTerm),
  );

  const navigateToeditPage = (editId) => {
    navigate(`/admin/editProduct/${editId}`);
  };

  if (isError) return <p>Error loading filters</p>;

  return (
    <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible">
      {/* Green Sticker Header */}
      <div className="absolute -top-4 -left-3 bg-[#22c55e] text-black border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
        <h1 className="font-black text-[16px] uppercase tracking-widest text-sm ">
          Products Table
        </h1>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="flex-col border-b-2 border-black rounded-t-[5px] flex md:flex-row items-center justify-end p-4 pt-8 gap-4">
        <div className="flex items-center gap-1 flex-col md:flex-row">
          <label className="font-black  uppercase text-[11px] tracking-widest text-gray-500 md:mb-0 mb-1 ml-1">
            Search Products
          </label>
          <div className="flex items-center relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Toy car..."
              className="border border-black w-full md:w-[300px] rounded-[5px] p-2 pr-10 focus:outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            />
            <IoSearch className="absolute right-3" size={20} />
          </div>
        </div>
      </div>

      <div className="overflow-y-auto h-[600px] py-3">
        {isPending ? (
          <div className="p-4">
            <AdminTableSkeleton />
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black relative">
              <tr>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-left">
                  Product Name
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Category
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Supplier
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Supplier
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Tax Status
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Price
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Status
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Reviews
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Sold
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Points
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Created
                </th>
                <th className="font-black text-[16px] uppercase tracking-widest text-black p-4 pb-2 text-center">
                  Actions
                </th>
                {productArray.length > 0 && enableMultiDel && (
                  <th className="p-4 pb-2 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                    />
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black text-[13px]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.productImages[0]}
                          alt="Product img"
                          className="size-10 rounded-[5px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] object-cover bg-white"
                        />
                        <span className=" text-[16px] tracking-tight text-black">
                          {product.productName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px]  text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {product.category && product.category.categoryName}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {product.supplier?.supplierName || "N/A"}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-white rounded-[3px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                        {product.supplier?.supplierName || "N/A"}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 border border-black rounded-[3px] text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${product.taxStatus === "vatable" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {product.taxStatus || "N/A"}
                      </span>
                    </td>

                    <td className="p-4 text-center font-mono  text-[16px] text-black">
                      {formatPrice(product?.price)}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 border border-black bg-indigo-50 text-indigo-800 rounded-[3px]  text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {product.status}
                      </span>
                    </td>

                    <td className="p-4 text-center  text-[16px]">
                      {product?.reviews?.length}
                    </td>

                    <td className="p-4 text-center  text-[16px] text-green-600">
                      {product?.sold}
                    </td>

                    <td className="p-4 text-center  text-[16px]">
                      {product?.points}
                    </td>

                    <td className="p-4 text-center  text-[16px] text-gray-500 font-mono">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigateToeditPage(product._id)}
                          title="Edit"
                          className="p-2 border border-black bg-yellow-400 text-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <CiEdit size={18} className="stroke-[1px]" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
                          title="Delete"
                          className="p-2 border border-black bg-red-500 text-white rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                        >
                          <MdDelete size={18} />
                        </button>
                        <button
                          onClick={() => addToSlider(product._id)}
                          className={`px-3 py-1.5 border border-black rounded-[5px]  text-[16px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${
                            !product?.isBestProduct
                              ? "bg-blue-500 text-white"
                              : "bg-white text-black"
                          }`}
                        >
                          {!product?.isBestProduct
                            ? "Add Slider"
                            : "Rem Slider"}
                        </button>
                      </div>
                    </td>
                    {productArray.length > 0 && enableMultiDel && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product._id)}
                          onChange={() => pushMultipleProd(product._id)}
                          className="w-4 h-4 border border-black rounded-[3px] checked:bg-black transition-all cursor-pointer"
                        />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="p-8 text-center  text-[16px] uppercase text-gray-400 tracking-widest"
                  >
                    no products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedIds && selectedIds.length > 0 && (
        <div className="w-full flex gap-3 justify-end p-4 border-t border-black bg-gray-50">
          <button
            onClick={cancelMultiDel}
            className="px-6 py-2 border border-black bg-white font-black text-[16px] uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleMultiDelete()}
            className="px-6 py-2 border border-black bg-red-600 text-white font-black text-[16px] uppercase text-xs rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      )}
    </div>
  );
}
