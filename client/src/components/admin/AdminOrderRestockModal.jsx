import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import formatPrice from "../../reusable/formatPrice";
import FormModal from "../../reusable/FormModal";

export default function AdminOrderRestockModal({ singleStock, onClose }) {
  const [productId, setProductId] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierPrice, setSupplierPrice] = useState(0);
  const [shopPrice, setShopPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [deliveryId, setDeliveryId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [selectedVatValue, setSelectedVatValue] = useState(null);

  const queryClient = useQueryClient();

  console.log(singleStock);

  useEffect(() => {
    if (singleStock) {
      setProductId(singleStock?.product?._id);
      setSupplier(singleStock?.supplier?._id);
      setSupplierPrice(singleStock?.supplierPrice);
      setShopPrice(singleStock?.shopPrice);
      setShippingPrice(singleStock?.shippingPrice);
      setDeliveryId(singleStock?.deliveryId);
      setSelectedDate(singleStock?.dateDelivery);

      // Initialize VAT from stock or product
      if (singleStock?.vat) {
        setSelectedVatValue(singleStock.vat.vatPercent);
      }
    }
  }, [singleStock]);

  // calculate total expenses (SUPPLIER PRICE + SHIPPING PRICE MULTIPLY BY QUANTITY)
  const calculateTotalExpenses =
    Number(supplierPrice) * Number(quantity) + Number(shippingPrice);

  const totalPriceWithVAT =
    Number(shopPrice) +
    Number(shopPrice) * (selectedVatValue ? selectedVatValue / 100 : 0);
  const roundedPrice = Math.round(totalPriceWithVAT);

  useEffect(() => {
    if (calculateTotalExpenses >= 0) setTotalCost(calculateTotalExpenses);
  }, [calculateTotalExpenses]);

  const { mutate: reOrderStockMutation, isPending: isSubmitting } = useMutation(
    {
      mutationFn: async (data) => {
        const res = await axiosInstance.put(
          `/stocks/reOrder-stock/${singleStock?._id}`,
          data
        );
        return res.data;
      },
      onSuccess: () => {
        toast.success("Success");
        queryClient.invalidateQueries({ queryKey: ["stocks"] });
        onClose();
      },
      onError: (err) => {
        toast.error(err.response.data.message || "Something went wrong");
      },
    }
  );

  const hanldeFormSubmit = (e) => {
    e.preventDefault();

    reOrderStockMutation({
      productId,
      supplier,
      supplierPrice,
      shopPrice,
      shippingPrice,
      quantity,
      totalCost,
      deliveryId,
      dateDelivery: selectedDate,
      vatPercent: selectedVatValue?._id,
      vatShopPrice: roundedPrice,
    });
  };

  return (
    <FormModal
      isOpen={true}
      title="Re-order Stock"
      onClose={onClose}
      onSubmit={hanldeFormSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Re-order"
    >
      <div className="flex gap-2 p-2 flex-col">
        <div className="flex gap-4 flex-col">
          <label className="font-medium">Product Name: </label>
          <input
            type="text"
            value={singleStock?.product?.productName || ""}
            disabled
            className="border border-gray-300 rounded-[5px] p-2 bg-gray-100"
          />
        </div>

        <div className="flex gap-4 flex-col">
          <label className="font-medium">Delivery ID: </label>
          <input
            value={deliveryId || ""}
            type="text"
            disabled
            className="border border-gray-300 rounded-[5px] p-2 bg-gray-100"
          />
        </div>

        <div className="flex gap-4 flex-col">
          <label className="font-medium">VAT Percent: </label>
          <input
            type="text"
            disabled
            value={selectedVatValue ? `${selectedVatValue}%` : "Exempt (0%)"}
            className="border border-gray-300 rounded-[5px] p-2 bg-gray-100"
          />
        </div>

        <div className="flex gap-4 flex-col">
          <label className="font-medium">Supplier: </label>
          <input
            type="text"
            value={singleStock?.supplier?.supplierName || ""}
            disabled
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
              step="any"
              required
            />
          </div>
        </div>

        {selectedVatValue?.vatPercent > 0 && (
          <p className="text-sm text-green-700">
            Shop price with VAT = ₱{formatPrice(roundedPrice)}
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
      </div>
    </FormModal>
  );
}
