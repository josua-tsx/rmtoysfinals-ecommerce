import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      product: productId || undefined,
      supplier: supplier || undefined,
      supplierPrice,
      shopPrice,
      shippingPrice,
      quantity,
      totalCost,
      deliveryId,
      dateDelivery: selectedDate,
      vatPercent: singleStock?.vat?._id || null,
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
      submitLabel="RE-ORDER"
    >
      <div className="flex gap-4 p-2 flex-col">
        <div className="flex gap-2 flex-col">
          <label className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1">
            Product Name
          </label>
          <input
            type="text"
            value={singleStock?.product?.productName || ""}
            disabled
            className="border border-black rounded-[5px] p-2 bg-gray-100 font-bold opacity-70"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex gap-2 flex-col">
            <label className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1">
              Delivery ID
            </label>
            <input
              value={deliveryId || ""}
              type="text"
              disabled
              className="border border-black rounded-[5px] p-2 bg-gray-100 font-mono font-bold opacity-70"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1">
              VAT Percent
            </label>
            <input
              type="text"
              disabled
              value={selectedVatValue ? `${selectedVatValue}%` : "0%"}
              className="border border-black rounded-[5px] p-2 bg-gray-100 font-mono font-bold opacity-70"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-col">
          <label className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1">
            Supplier
          </label>
          <input
            type="text"
            value={singleStock?.supplier?.supplierName || ""}
            disabled
            className="border border-black rounded-[5px] p-2 bg-gray-100 font-bold opacity-70"
          />
        </div>

        <div className="flex gap-2 flex-col">
          <label
            htmlFor="deliveryDate"
            className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1"
          >
            Date Delivery
          </label>
          <input
            type="date"
            id="deliveryDate"
            className="border border-black rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-bold"
            max={new Date().toISOString().split("T")[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="supplierPrice"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1"
            >
              Supplier Price (PHP)
            </label>
            <input
              className="border border-black rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold"
              type="number"
              min={0}
              id="supplierPrice"
              value={supplierPrice}
              onChange={(e) => setSupplierPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="shopPrice"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1"
            >
              Shop Price (PHP)
            </label>
            <input
              className="border border-black rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold"
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

        {selectedVatValue > 0 && (
          <div className="p-3 bg-green-50 border border-black rounded-[5px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-green-700 tracking-widest mb-1">
              Price with VAT
            </p>
            <p className="text-lg font-black font-mono">
              ₱{formatPrice(roundedPrice)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="shippingPrice"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1"
            >
              Shipping Price (PHP)
            </label>
            <input
              className="border border-black rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold"
              type="number"
              min={0}
              id="shippingPrice"
              value={shippingPrice}
              onChange={(e) => setShippingPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="quantity"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1"
            >
              Quantity
            </label>
            <input
              className="border border-black rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold"
              type="number"
              id="quantity"
              value={quantity}
              min={0}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-indigo-50 p-4 rounded-[5px] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2">
          <div className="flex justify-between items-center">
            <span className="font-black uppercase text-[10px] tracking-widest text-indigo-700">
              Total Cost Estimate
            </span>
            <span className="font-mono font-black text-xl text-indigo-900">
              ₱{formatPrice(totalCost)}
            </span>
          </div>
          <p className="text-[8px] text-indigo-400 font-bold uppercase tracking-widest mt-1 border-t border-indigo-200 pt-1">
            (SUPPLIER PRICE * QUANTITY) + SHIPPING
          </p>
        </div>
      </div>
    </FormModal>
  );
}
