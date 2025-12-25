import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import { useState, useEffect } from "react";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useUserStore } from "../../stores/useUserStore";
import FormModal from "../../reusable/FormModal";
import toast from "react-hot-toast";
import formatPrice from "../../reusable/formatPrice";
import { MdToggleOff, MdToggleOn } from "react-icons/md";
import { ConfirmModal } from "../../reusable/ConfirmModal";

export default function AdminStocksPending() {
  const currentUser = useUserStore((state) => state.currentUser);
  const queryClient = useQueryClient();

  const [productToDelete, setProductToDelete] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  // Modal & Selection State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form State
  const [supplier, setSupplier] = useState("");
  const [supplierPrice, setSupplierPrice] = useState(0);
  const [shopPrice, setShopPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [deliveryId, setDeliveryId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [toggleNotify, setToggleNotify] = useState(false);
  const [selectedVat, setSelectedVat] = useState(""); // NEW: VAT Selection State

  // Derived Values
  const calculateTotalExpenses =
    Number(supplierPrice) * Number(quantity) + Number(shippingPrice);

  // Queries
  const {
    data: products = [],
    isPending: isProductsPending,
    isError: isProductsError,
  } = useQuery({
    queryKey: ["pendingProducts"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-stockStatus-pendings`);
      return res.data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/supplier/get-suppliers`);
      return res.data;
    },
  });

  // NEW: Fetch VATS
  const { data: vats = [] } = useQuery({
    queryKey: ["vats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/vat/get-vat`);
      return res.data;
    },
  });

  // Calculate VAT Details
  // Find the selected/current VAT object from the vats list or the product's embedded vat
  const currentVatObject =
    vats.find((v) => v._id === selectedVat) || selectedProduct?.vat;
  const productVatPercent = currentVatObject?.vatPercent || 0;

  const totalPriceWithVAT = Number(shopPrice) * (1 + productVatPercent / 100);
  const roundedPrice = Math.round(totalPriceWithVAT);

  // Effects
  useEffect(() => {
    if (calculateTotalExpenses >= 0) {
      setTotalCost(calculateTotalExpenses);
    }
  }, [calculateTotalExpenses]);

  // Generators
  const generateRandomDeliveryId = () => {
    return (
      "DELIVERY-" + Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  };

  console.log(selectedProduct);

  // Mutations
  const { mutate: addNewDeliver, isPending: isSubmitting } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/stocks/new-deliver`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Stock ordered successfully!");
      queryClient.invalidateQueries(["pendingProducts"]);
      queryClient.invalidateQueries(["stocks"]);
      setFormDefaults();
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: async (productId) => {
      const res = await axiosInstance.delete(
        `/product/delete-product/${productId}`
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
    setDeliveryId(generateRandomDeliveryId());
    setFormDefaults(); // Reset form fields

    // Pre-select VAT if product has one, otherwise empty
    setSelectedVat(product?.vat?._id || "");

    setIsModalOpen(true);
  };

  const setFormDefaults = () => {
    setSupplier("");
    setSupplierPrice(0);
    setShopPrice(0);
    setShippingPrice(0);
    setQuantity(0);
    setTotalCost(0);
    setSelectedDate("");
    setToggleNotify(false);
    setSelectedVat("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!supplier) return toast.error("Please select a supplier");
    if (!selectedDate) return toast.error("Please select a delivery date");

    // We send the explicitly selected VAT, or fallback to the product's original VAT (though the UI forces selection if we want)
    const vatToSend = selectedVat || selectedProduct?.vat?._id;

    addNewDeliver({
      product: selectedProduct._id,
      supplier,
      supplierPrice,
      shopPrice,
      quantity,
      shippingPrice,
      totalCost,
      deliveryId,
      dateDelivery: selectedDate,
      vat: vatToSend,
      vatShopPrice: roundedPrice,
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

  return (
    <section className="bg-yellow text-sm md:text-normal h-screen font-main">
      <AdminHeader title={"PENDING STOCKS"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        {/* Table Container */}
        <div className="relative border border-black flex flex-col rounded-[5px] w-full h-full mx-auto bg-card">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className=" flex flex-col overflow-x-auto gap-4 h-[600px] overflow-y-auto">
            {isProductsPending ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner />
              </div>
            ) : (
              <table className="w-full divide-y divide-gray-700 min-w-[800px]">
                <thead>
                  <tr>
                    <th className="font-normal p-2 pb-5 text-left">Image</th>
                    <th className="font-normal p-2 pb-5 text-left">
                      Product Name
                    </th>
                    <th className="font-normal p-2 pb-5 text-left">Category</th>
                    <th className="font-normal p-2 pb-5 text-left">
                      Description
                    </th>
                    <th className="font-normal p-2 pb-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td className="p-2">
                          <img
                            src={product?.productImages[0]}
                            alt={product?.productName}
                            className="h-[50px] w-[50px] object-cover rounded-[5px] border border-gray-300"
                          />
                        </td>
                        <td className="p-2 font-medium">
                          {product?.productName}
                        </td>
                        <td className="p-2">
                          {product?.category?.categoryName}
                        </td>
                        <td
                          className="p-2 max-w-[300px] truncate"
                          title={product?.productDescription}
                        >
                          {product?.productDescription}
                        </td>
                        <td className="p-2 text-center flex gap-2 justify-center">
                          <button
                            disabled={currentUser.role === "validatorStaff"}
                            onClick={() => handleOpenModal(product)}
                            className={`border bg-primary hover:bg-primary/90 rounded-[5px] text-white px-3 py-1 border-black transition-colors ${
                              currentUser.role === "validatorStaff"
                                ? "opacity-50 cursor-not-allowed hidden"
                                : ""
                            }`}
                          >
                            Order Stock
                          </button>
                          <button
                            disabled={currentUser.role === "validatorStaff"}
                            onClick={() => handleDeleteClick(product._id)}
                            className={`border bg-red-600 hover:bg-red-700 rounded-[5px] text-white px-3 py-1 border-black transition-colors ${
                              currentUser.role === "validatorStaff"
                                ? "opacity-50 cursor-not-allowed hidden"
                                : ""
                            }`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-4">
                        No pending stocks found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Order Stock Modal */}
      <FormModal
        isOpen={isModalOpen}
        title="Order Stock"
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        submitLabel="Order"
        isSubmitting={isSubmitting}
      >
        <div className="flex gap-2 p-2 flex-col">
          <div className="flex gap-4 flex-col">
            <label className="font-medium">Product Name: </label>
            <input
              type="text"
              value={selectedProduct?.productName || ""}
              disabled
              className="border border-gray-300 rounded-[5px] p-2 bg-gray-100"
            />
          </div>

          <div className="flex gap-4 flex-col">
            <label className="font-medium">Delivery ID: </label>
            <input
              value={deliveryId}
              type="text"
              disabled
              className="border border-gray-300 rounded-[5px] p-2 bg-gray-100"
            />
          </div>

          {/* NEW: VAT Selection */}
          <div className="flex gap-4 flex-col">
            <label htmlFor="vat" className="font-medium">
              VAT:
            </label>
            <input
              type="text"
              disabled
              value={selectedProduct?.vat?.vatPercent || "N/A"}
              className="border border-gray-300 rounded-[5px] p-2 bg-gray-100"
            />
          </div>

          <div className="flex gap-4 flex-col">
            <label htmlFor="deliveryDate" className="font-medium">
              Date Delivery:{" "}
            </label>
            <input
              type="date"
              id="deliveryDate"
              className="border border-black rounded-[5px] p-2"
              max={new Date().toISOString().split("T")[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4 flex-col">
            <label htmlFor="supplier" className="font-medium">
              Supplier:{" "}
            </label>
            <select
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="rounded-[5px] border border-black p-2 outline-none"
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.length > 0 &&
                suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.supplierName}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="supplierPrice" className="font-medium">
                Supplier Price:{" "}
              </label>
              <input
                className="border border-black rounded-[5px] p-2"
                type="number"
                min={0}
                id="supplierPrice"
                value={supplierPrice}
                onChange={(e) => setSupplierPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="shopPrice" className="font-medium">
                Shop Price:{" "}
              </label>
              <input
                className="border border-black rounded-[5px] p-2"
                type="number"
                min={0}
                id="shopPrice"
                value={shopPrice}
                onChange={(e) => setShopPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {productVatPercent > 0 && (
            <p className="text-sm text-green-700">
              Shop price with VAT ({productVatPercent}%) = ₱{roundedPrice}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="shippingPrice" className="font-medium">
                Shipping Price:{" "}
              </label>
              <input
                className="border border-black rounded-[5px] p-2"
                type="number"
                min={0}
                id="shippingPrice"
                value={shippingPrice}
                onChange={(e) => setShippingPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="quantity" className="font-medium">
                Quantity:{" "}
              </label>
              <input
                className="border border-black rounded-[5px] p-2"
                type="number"
                id="quantity"
                value={quantity}
                min={0}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 bg-gray-100 p-2 rounded">
            <span className="font-bold">Total Cost: </span>
            <span>{formatPrice(totalCost)} PHP</span>
            <p className="text-xs text-red-700 ml-auto">
              (SUPPLIER PRICE * QUANTITY) + SHIPPING
            </p>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <label>Notify subscribed users?</label>
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
