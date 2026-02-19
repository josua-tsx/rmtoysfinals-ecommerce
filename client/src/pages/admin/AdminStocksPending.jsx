import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderStockSchema } from "../../schemas/stock.schema";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import { useState, useEffect } from "react";
import { useUserStore } from "../../stores/useUserStore";
import FormModal from "../../reusable/FormModal";
import ValidatedInput from "../../reusable/ValidatedInput";
import toast from "react-hot-toast";
import formatPrice from "../../reusable/formatPrice";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import { ConfirmModal } from "../../reusable/ConfirmModal";
import ReusableTable from "../../reusable/ReusableTable";
import useDebounce from "../../hooks/useDebounce";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function AdminStocksPending() {
  const currentUser = useUserStore((state) => state.currentUser);
  const queryClient = useQueryClient();

  // Search & Pagination State
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [productToDelete, setProductToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Modal & Selection State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toggleNotify, setToggleNotify] = useState(false);

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(orderStockSchema),
    defaultValues: {
      product: "",
      supplier: "",
      deliveryId: "",
      dateDelivery: "",
      supplierPrice: 0,
      shopPrice: 0,
      shippingPrice: 0,
      quantity: 0,
      totalCost: 0,
      vat: "",
      vatShopPrice: 0,
      notifySubscribedUser: false,
    },
  });

  // Watch values for calculations
  const supplierPrice = watch("supplierPrice");
  const shopPrice = watch("shopPrice");
  const shippingPrice = watch("shippingPrice");
  const quantity = watch("quantity");
  const deliveryId = watch("deliveryId");

  // Calculate derived values — clamp to prevent layout-breaking numbers
  const rawTotalCost =
    Number(supplierPrice) * Number(quantity) + Number(shippingPrice);
  const totalCost = Math.min(rawTotalCost, 999999999);

  // Update totalCost when calculated
  useEffect(() => {
    setValue("totalCost", totalCost);
  }, [totalCost, setValue]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setIsConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  // Queries
  const {
    data,
    isPending: isProductsPending,
    isError: isProductsError,
  } = useQuery({
    queryKey: ["pendingProducts", page, limit, debouncedSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }
      const res = await axiosInstance.get(
        `/product/get-stockStatus-pendings?${params.toString()}`,
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const products = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || products.length;
  const currentPage = data?.currentPage || 1;

  const { data: suppliersData = [] } = useQuery({
    queryKey: ["suppliers", "pendingStocksDropdown"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/supplier/get-suppliers?limit=1000`);
      return res.data;
    },
  });

  const suppliers = Array.isArray(suppliersData)
    ? suppliersData
    : Array.isArray(suppliersData?.suppliers)
      ? suppliersData.suppliers
      : [];

  // Calculate VAT Details
  const productVatPercent = selectedProduct?.vat?.vatPercent || 0;
  const totalPriceWithVAT = Number(shopPrice) * (1 + productVatPercent / 100);
  const roundedPrice = Math.round(totalPriceWithVAT);

  // Update vatShopPrice when calculated
  useEffect(() => {
    setValue("vatShopPrice", roundedPrice);
  }, [roundedPrice, setValue]);

  // Generators
  const generateRandomDeliveryId = () => {
    return (
      "DELIVERY-" + Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  };

  // Mutations
  const { mutate: addNewDeliver, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/stocks/order-stock`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Stock ordered successfully!");
      queryClient.invalidateQueries(["pendingProducts"]);
      queryClient.invalidateQueries(["stocks"]);
      reset();
      setIsModalOpen(false);
      setToggleNotify(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.delete(
        `/product/delete-product/${productId}`,
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Pending product removed successfully");
      queryClient.invalidateQueries(["pendingProducts"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to remove product");
    },
  });

  // Handlers
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setToggleNotify(false);

    // Reset form with new values
    reset({
      product: product?._id || "",
      supplier: "",
      deliveryId: generateRandomDeliveryId(),
      dateDelivery: "",
      supplierPrice: 0,
      shopPrice: 0,
      shippingPrice: 0,
      quantity: 0,
      totalCost: 0,
      vat: product?.vat?._id || "",
      vatShopPrice: 0,
      notifySubscribedUser: false,
    });

    setIsModalOpen(true);
  };

  const onSubmit = (data) => {
    addNewDeliver({
      ...data,
      notifySubscribedUser: toggleNotify,
    });
  };

  const toggleNotification = () => {
    setToggleNotify((prev) => !prev);
    if (toggleNotify) {
      toast.error("Notification OFF");
    } else {
      toast.success("Notification ON");
    }
  };

  if (isProductsError) {
    return <p>Error loading pending stocks.</p>;
  }

  // Column Definitions for ReusableTable
  const columns = [
    {
      header: "Image",
      className: "text-left",
      render: (product) => (
        <img
          src={product?.productImages?.[0]}
          alt={product?.productName}
          className="h-[50px] w-[50px] object-cover rounded-[5px] border border-gray-300"
        />
      ),
    },
    {
      header: "Product Name",
      className: "text-left",
      render: (product) => (
        <span className="font-medium">{product?.productName}</span>
      ),
    },
    {
      header: "Category",
      className: "text-left",
      render: (product) => <span>{product?.category?.categoryName}</span>,
    },
    {
      header: "Description",
      className: "text-left",
      render: (product) => (
        <span
          className="max-w-[300px] truncate block"
          title={product?.productDescription}
        >
          {product?.productDescription}
        </span>
      ),
    },
    {
      header: "Action",
      className: "text-center",
      render: (product) => (
        <div className="flex gap-2 justify-center">
          {currentUser.role !== "validatorStaff" && (
            <>
              <button
                onClick={() => handleOpenModal(product)}
                className="border bg-primary hover:bg-primary/90 rounded-[5px] text-white px-3 py-1 border-black transition-colors"
              >
                Order Stock
              </button>
              <button
                onClick={() => handleDeleteClick(product._id)}
                className="border bg-red-600 hover:bg-red-700 rounded-[5px] text-white px-3 py-1 border-black transition-colors"
              >
                Remove
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="bg-yellow text-sm md:text-normal h-screen font-main pb-20 overflow-y-auto">
      <AdminHeader title={"PENDING STOCKS"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        <ReusableTable
          title="Pending Stocks"
          columns={columns}
          data={products}
          isLoading={isProductsPending}
          search={{
            value: localSearchTerm,
            onChange: setLocalSearchTerm,
            placeholder: "Search products...",
          }}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            onPageChange: setPage,
          }}
          emptyMessage="No pending stocks found."
        />
      </div>

      {/* Order Stock Modal */}
      <FormModal
        isOpen={isModalOpen}
        title="Order Stock"
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Order"
        isSubmitting={isPending || isSubmitting}
      >
        <div className="flex gap-4 p-2 flex-col">
          <div className="flex gap-2 flex-col">
            <label className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1">
              Product Name
            </label>
            <input
              type="text"
              value={selectedProduct?.productName || ""}
              disabled
              className="border border-black rounded-[5px] p-2 bg-gray-100 font-bold"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1">
              Delivery ID
            </label>
            <input
              value={deliveryId}
              type="text"
              disabled
              className="border border-black rounded-[5px] p-2 bg-gray-100 font-mono"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label
              htmlFor="vat"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
            >
              VAT (%)
            </label>
            <input
              type="text"
              disabled
              value={
                selectedProduct?.vat?.vatPercent
                  ? `${selectedProduct.vat.vatPercent}%`
                  : "N/A"
              }
              className="border border-black rounded-[5px] p-2 bg-gray-100 font-bold"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label
              htmlFor="deliveryDate"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
            >
              Date Delivery
            </label>
            <input
              type="date"
              id="deliveryDate"
              className={`border ${errors.dateDelivery ? "border-red-500" : "border-black"} rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-bold`}
              {...register("dateDelivery")}
            />
            {errors.dateDelivery && (
              <p className="text-red-500 text-xs font-bold">
                {errors.dateDelivery.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 flex-col">
            <label
              htmlFor="supplier"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
            >
              Supplier
            </label>
            <select
              id="supplier"
              {...register("supplier")}
              className={`rounded-[5px] border ${errors.supplier ? "border-red-500" : "border-black"} p-2 outline-none font-bold`}
            >
              <option value="">Select Supplier</option>
              {suppliers.length > 0 &&
                suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName}
                  </option>
                ))}
            </select>
            {errors.supplier && (
              <p className="text-red-500 text-xs font-bold">
                {errors.supplier.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="supplierPrice"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Supplier Price
              </label>
              <ValidatedInput
                type="number"
                id="supplierPrice"
                {...register("supplierPrice")}
                error={errors.supplierPrice}
                min={0}
                max={1000000}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="shopPrice"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Shop Price
              </label>
              <ValidatedInput
                type="number"
                id="shopPrice"
                {...register("shopPrice")}
                error={errors.shopPrice}
                min={0}
                max={1000000}
              />
            </div>
          </div>

          {productVatPercent > 0 && (
            <p className="text-[11px] font-black text-green-700 uppercase tracking-tight italic">
              Shop price with VAT ({productVatPercent}%) = ₱{roundedPrice}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="shippingPrice"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Shipping Price
              </label>
              <ValidatedInput
                type="number"
                id="shippingPrice"
                {...register("shippingPrice")}
                error={errors.shippingPrice}
                min={0}
                max={100000}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="quantity"
                className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1"
              >
                Quantity
              </label>
              <ValidatedInput
                type="number"
                id="quantity"
                {...register("quantity")}
                error={errors.quantity}
                min={0}
                max={1000}
              />
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 bg-gray-100 p-3 rounded-[5px] border-l-4 border-primary overflow-hidden">
            <span className="font-black uppercase text-xs tracking-widest">
              Total Cost:{" "}
            </span>
            <span className="font-bold text-lg truncate max-w-[200px]">
              {formatPrice(totalCost)} PHP
            </span>
            <p className="text-[9px] text-gray-500 uppercase font-bold italic ml-auto">
              (SUPPLIER PRICE * QUANTITY) + SHIPPING
            </p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <label className="font-black uppercase text-[10px] tracking-widest text-gray-500 pl-1">
              Notify subscribed users?
            </label>
            <button
              type="button"
              className={`${!toggleNotify ? "text-red-700" : "text-blue-700"}`}
              onClick={toggleNotification}
            >
              {toggleNotify ? (
                <MdToggleOn size={35} />
              ) : (
                <MdToggleOff size={35} />
              )}
            </button>
          </div>
        </div>
      </FormModal>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Confirm Deletion"
        message="Are you sure you want to remove this pending product? This will delete the product permanently."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </section>
  );
}
