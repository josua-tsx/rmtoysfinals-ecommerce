import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoIosClose } from "react-icons/io";
import axiosInstance from "../../lib/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import formatPrice from "../../reusable/formatPrice";
import { MdToggleOff, MdToggleOn } from "react-icons/md";

export default function AdminOrderStocksModal({ singleOrder, onClose }) {
  const [product, setProduct] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierPrice, setSupplierPrice] = useState(0);
  const [shopPrice, setShopPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [deliveryId, setDeliveryId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");


  const [toggleNotify, setToggleNotify] = useState(false);

  const [selectedVatValue, setSelectedVatValue] = useState(null);

  // calculate total expenses (SUPPLIER PRICE + SHIPPING PRICE MULTIPLY BY QUANTITY)
  const calculateTotalExpenses =
    Number(supplierPrice) * Number(quantity) + Number(shippingPrice);
  const totalPriceWithVAT =
    Number(shopPrice) + Number(shopPrice) * selectedVatValue?.vatValue;
  const roundedPrice = Math.round(totalPriceWithVAT);

  useEffect(() => {
    if (calculateTotalExpenses) setTotalCost(calculateTotalExpenses);
  }, [calculateTotalExpenses]);

  const generateRandomDeliveryId = () => {
    return (
      "DELIVERY-" + Math.random().toString(36).substring(2, 6).toUpperCase()
    );
  };

  useEffect(() => {
    setDeliveryId(generateRandomDeliveryId());
  }, [singleOrder]);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (singleOrder) {
      setProduct(singleOrder._id);
    }
  }, [singleOrder]);

  const {
    data: vats = [],
    isVatPending,
    isVatError,
  } = useQuery({
    queryKey: ["vats"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/vat/get-vat`);
      return res.data;
    },
  });

  const handleVatOnChange = (e) => {
    const selectedVatId = e.target.value;
    const selectedVatValue = vats.find((vat) => vat._id === selectedVatId);

    setSelectedVatValue(selectedVatValue);
  };

  const {
    data: suppliers = [],
    isPending: isSuppliersPending,
    isError: isSuppliersError,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/supplier/get-suppliers`);
      return res.data;
    },
  });

  const { mutate: addNewDeliver } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(`/stocks/new-deliver`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Success");
      queryClient.invalidateQueries(["pendingProducts"]);
      queryClient.invalidateQueries(["stocks"]);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Something went wrong!");
    },
  });

  const toggleNotifcation = () => {
    setToggleNotify((prev) => !prev);

    if (toggleNotify) {
      toast.error("Notification Updated false");
    } else {
      toast.success("Notification Updated to true");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    addNewDeliver({
      product,
      supplier,
      supplierPrice,
      shopPrice,
      quantity,
      shippingPrice,
      totalCost,
      deliveryId,
      dateDelivery: selectedDate,

      vat: selectedVatValue?._id,
      vatShopPrice: roundedPrice,
      notifySubscribedUser: toggleNotify,
    });
  };

  if (isSuppliersPending || isVatPending) return <p>Loading...</p>;
  if (isSuppliersError || isVatError) return <p>Error...</p>;

  return (
    <section className="fixed inset-0 z-50 backdrop-blur-sm p-3">
      <div className="h-screen flex flex-col justify-center items-center mx-auto">
        <form
          onSubmit={handleFormSubmit}
          className="border flex flex-col gap-10 relative border-black w-full md:w-[500px]  rounded-[5px] bg-card"
        >
          <div className="absolute -top-10 bg-primary border border-black left-0 rounded-[5px] text-card px-5 py-1">
            <h1>Order Stock</h1>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute border border-black text-card bg-red-700 rounded-[5px] px-5 right-0 -top-8"
          >
            <IoIosClose size={25} />
          </button>

          <div className="p-4 flex gap-2 flex-col">
            <div className="flex gap-4">
              <label htmlFor="">Product Name: </label>
              <input
                type="text"
                name="productName"
                id="productName"
                value={singleOrder?.productName}
                disabled
              />
            </div>

            <div className="flex gap-4">
              <label htmlFor="">Delivery ID: </label>
              <input
                value={deliveryId}
                type="text"
                id="deliveryId"
                name="deliveryId"
                disabled
              />
            </div>

            <div className="flex gap-4">
              <label htmlFor="deliveryDate">Date Delivery: </label>
              <input
                type="date"
                id="deliveryDate"
                name="deliveryDate"
                className="border border-black rounded-[5px] px-2"
                max={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <label htmlFor="">Supplier: </label>
              <select
                name="supplier"
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="rounded-[5px] border border-black outline-none"
              >
                <option value="">Select Supplier</option>
                {suppliers.length > 0 &&
                  suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.supplierName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-4">
              <label htmlFor="">VAT Percent: </label>
              <select
                name="vatPercent"
                id="vatPercent"
                value={selectedVatValue?._id}
                onChange={handleVatOnChange}
                className="rounded-[5px] border border-black outline-none"
              >
                <option value="">Select VAT Percent</option>
                {vats.length > 0 &&
                  vats.map((vat) => (
                    <option key={vat._id} value={vat?._id}>
                      {vat.vatPercent} %
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-4">
              <label htmlFor="supplierPrice">Supplier Price: </label>
              <input
                className="border border-black rounded-[5px] px-2"
                type="number"
                min={0}
                name="supplierPrice"
                id="supplierPrice"
                value={supplierPrice}
                onChange={(e) => setSupplierPrice(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <label htmlFor="shopPrice">Shop Price: </label>
              <input
                className="border border-black rounded-[5px] px-2"
                type="number"
                min={0}
                name="shopPrice"
                id="shopPrice"
                value={shopPrice}
                onChange={(e) => setShopPrice(e.target.value)}
              />
            </div>

            {selectedVatValue?.vatPercent > 0 && (
              <p>Shop price with VAT = {roundedPrice}</p>
            )}

            <div className="flex gap-4">
              <label htmlFor="shippingPrice">Shipping Price: </label>
              <input
                className="border border-black rounded-[5px] px-2"
                type="number"
                min={0}
                name="shippingPrice"
                id="shippingPrice"
                value={shippingPrice}
                onChange={(e) => setShippingPrice(e.target.value)}
              />
            </div>

      

            <div className="flex gap-4">
              <label htmlFor="quantity">Quantity: </label>
              <input
                className="border border-black rounded-[5px] px-2"
                type="number"
                name="quantity"
                id="quantity"
                value={quantity}
                min={0}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-4">
              <p>Total Cost: </p>
              <p>{formatPrice(totalCost)} PHP</p>
              <p className="text-sm text-red-700">
                (SUPPLIER PRCE + SHIPPING PRICE) * QUANTITY
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-4">
              <label htmlFor="">Notify subscribed users for this order?</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`${
                    !toggleNotify ? "text-red-700" : "text-blue-700"
                  }`}
                  onClick={toggleNotifcation}
                >
                  {toggleNotify ? (
                    <MdToggleOn size={45} />
                  ) : (
                    <MdToggleOff size={45} />
                  )}
                </button>
                <span className="text-sm">
                  {toggleNotify ? "Notifications ON" : "Notifications OFF"}
                </span>
              </div>
            </div>
          </div>

          <button className="bg-primary text-card p-2 rounded-bl-[5px] rounded-br-[5px]">
            Order
          </button>
        </form>
      </div>
    </section>
  );
}
