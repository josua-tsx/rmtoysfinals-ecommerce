import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import toast from "react-hot-toast";
import { MdRestore } from "react-icons/md";
import formatPrice from "../../reusable/formatPrice";

export default function AdminArchives() {
  const [activeTab, setActiveTab] = useState("products");
  const queryClient = useQueryClient();

  // --- QUERIES ---
  const { data: products = [], isPending: productsLoading } = useQuery({
    queryKey: ["archivedProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/get-archived-products");
      return res.data;
    },
    enabled: activeTab === "products",
  });

  const { data: categories = [], isPending: categoriesLoading } = useQuery({
    queryKey: ["archivedCategories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/category/get-archived-categories");
      return res.data;
    },
    enabled: activeTab === "categories",
  });

  const { data: suppliers = [], isPending: suppliersLoading } = useQuery({
    queryKey: ["archivedSuppliers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/supplier/get-archived-suppliers");
      return res.data;
    },
    enabled: activeTab === "suppliers",
  });

  const { data: workers = [], isPending: workersLoading } = useQuery({
    queryKey: ["archivedWorkers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/get-archived-workers");
      return res.data;
    },
    enabled: activeTab === "workers",
  });

  const { data: riders = [], isPending: ridersLoading } = useQuery({
    queryKey: ["archivedRiders"],
    queryFn: async () => {
      const res = await axiosInstance.get("/rider/get-archived-riders");
      return res.data;
    },
    enabled: activeTab === "riders",
  });

  // --- MUTATIONS ---
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

  const { mutate: restoreSupplier } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/supplier/restore-supplier/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedSuppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring supplier"),
  });

  const { mutate: restoreWorker } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/user/restore-worker/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedWorkers"] });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring worker"),
  });

  const { mutate: restoreRider } = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.patch(`/rider/restore-rider/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedRiders"] });
      queryClient.invalidateQueries({ queryKey: ["riders"] });
      toast.success("Rider restored successfully");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Error restoring rider"),
  });

  const handleRestore = (id) => {
    if (window.confirm("Are you sure you want to restore this item?")) {
      if (activeTab === "products") restoreProduct(id);
      if (activeTab === "categories") restoreCategory(id);
      if (activeTab === "suppliers") restoreSupplier(id);
      if (activeTab === "workers") restoreWorker(id);
      if (activeTab === "riders") restoreRider(id);
    }
  };

  const isLoading =
    (activeTab === "products" && productsLoading) ||
    (activeTab === "categories" && categoriesLoading) ||
    (activeTab === "suppliers" && suppliersLoading) ||
    (activeTab === "workers" && workersLoading) ||
    (activeTab === "riders" && ridersLoading);

  return (
    <section className="bg-[#fffdf6] min-h-screen pb-20 font-main">
      <AdminHeader title={"ARCHIVED ITEMS"} />

      <div className="max-w-[95%] pt-10 mx-auto px-4">
        {/* Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 border-b-2 border-black pb-4">
          {["products", "categories", "suppliers", "workers", "riders"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 uppercase font-black text-sm border border-black rounded-[5px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-black"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {/* Content */}
        <div className="bg-card border border-black rounded-[5px] relative mt-4">
          <div className="absolute -top-4 -left-3 bg-red-500 text-white border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
            <h1 className="font-black text-[16px] uppercase tracking-widest text-sm">
              Archived {activeTab}
            </h1>
          </div>

          <div className="p-8 pt-12 overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <LoadingSpinner />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="p-4 font-black uppercase">Name</th>
                    {activeTab === "products" && (
                      <>
                        <th className="p-4 font-black uppercase">Price</th>
                        <th className="p-4 font-black uppercase">Category</th>
                        <th className="p-4 font-black uppercase">Supplier</th>
                      </>
                    )}
                    {(activeTab === "workers" || activeTab === "riders") && (
                      <th className="p-4 font-black uppercase">Phone Number</th>
                    )}
                    {activeTab === "riders" && (
                      <th className="p-4 font-black uppercase">Status</th>
                    )}
                    <th className="p-4 font-black uppercase text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {activeTab === "products" &&
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
                        <td className="p-4 font-mono">
                          {formatPrice(item.price)}
                        </td>
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
                    ))}

                  {activeTab === "categories" &&
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
                    ))}

                  {activeTab === "suppliers" &&
                    suppliers.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold">{item.supplierName}</td>
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
                    ))}

                  {activeTab === "workers" &&
                    workers.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold">
                          <div className="flex flex-col">
                            <span>{item.fullName || item.username}</span>
                            <span className="text-xs text-gray-500 font-normal">
                              {item.email}
                            </span>
                            <span className="text-xs text-indigo-500 font-black uppercase">
                              {item.role}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          {item.phoneNumber || "N/A"}
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
                    ))}

                  {activeTab === "riders" &&
                    riders.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold">{item.riderName}</td>
                        <td className="p-4 font-mono">
                          {item.riderPhoneNumber}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded text-xs border border-black uppercase font-bold ${item.riderStatus === "available" ? "bg-green-200" : "bg-red-200"}`}
                          >
                            {item.riderStatus}
                          </span>
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
                    ))}

                  {!isLoading &&
                    ((activeTab === "products" && products.length === 0) ||
                      (activeTab === "categories" && categories.length === 0) ||
                      (activeTab === "suppliers" && suppliers.length === 0) ||
                      (activeTab === "workers" && workers.length === 0) ||
                      (activeTab === "riders" && riders.length === 0)) && (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-gray-500 uppercase tracking-widest font-bold"
                        >
                          No archived {activeTab} found
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
