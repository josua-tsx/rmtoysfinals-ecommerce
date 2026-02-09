import { useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import formatPrice from "../../reusable/formatPrice";
import FormModal from "../../reusable/FormModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Restock Schema
const restockSchema = z.object({
  supplierPrice: z.coerce
    .number({ required_error: "Supplier price is required" })
    .min(0, "Price must be positive"),
  shopPrice: z.coerce
    .number({ required_error: "Shop price is required" })
    .min(0, "Price must be positive"),
  shippingPrice: z.coerce
    .number({ required_error: "Shipping price is required" })
    .min(0, "Price must be positive"),
  quantity: z.coerce
    .number({ required_error: "Quantity is required" })
    .min(1, "Quantity must be at least 1"),
  dateDelivery: z.string().min(1, "Delivery date is required"),
});

export default function AdminOrderRestockModal({ singleStock, onClose }) {
  const queryClient = useQueryClient();

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      supplierPrice: 0,
      shopPrice: 0,
      shippingPrice: 0,
      quantity: 0,
      dateDelivery: "",
    },
  });

  // Watch values for calculations
  const supplierPrice = watch("supplierPrice");
  const shopPrice = watch("shopPrice");
  const shippingPrice = watch("shippingPrice");
  const quantity = watch("quantity");

  // VAT from stock
  const selectedVatValue = singleStock?.vat?.vatPercent || null;

  // Calculate derived values
  const totalCost =
    Number(supplierPrice) * Number(quantity) + Number(shippingPrice);
  const totalPriceWithVAT =
    Number(shopPrice) +
    Number(shopPrice) * (selectedVatValue ? selectedVatValue / 100 : 0);
  const roundedPrice = Math.round(totalPriceWithVAT);

  useEffect(() => {
    if (singleStock) {
      reset({
        supplierPrice: singleStock?.supplierPrice || 0,
        shopPrice: singleStock?.shopPrice || 0,
        shippingPrice: singleStock?.shippingPrice || 0,
        quantity: 0,
        dateDelivery: singleStock?.dateDelivery || "",
      });
    }
  }, [singleStock, reset]);

  const { mutate: reOrderStockMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post(
        `/stocks/reOrder-stock/${singleStock?._id}`,
        data,
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
  });

  const onSubmit = (data) => {
    reOrderStockMutation({
      product: singleStock?.product?._id || undefined,
      supplier: singleStock?.supplier?._id || undefined,
      supplierPrice: data.supplierPrice,
      shopPrice: data.shopPrice,
      shippingPrice: data.shippingPrice,
      quantity: data.quantity,
      totalCost: totalCost,
      deliveryId: singleStock?.deliveryId,
      dateDelivery: data.dateDelivery,
      vatPercent: singleStock?.vat?._id || null,
      vatShopPrice: roundedPrice,
    });
  };

  return (
    <FormModal
      isOpen={true}
      title="Re-order Stock"
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isPending || isSubmitting}
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
              value={singleStock?.deliveryId || ""}
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
            className={`border ${errors.dateDelivery ? "border-red-500" : "border-black"} rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-bold`}
            max={new Date().toISOString().split("T")[0]}
            {...register("dateDelivery")}
          />
          {errors.dateDelivery && (
            <p className="text-red-500 text-xs font-bold">
              {errors.dateDelivery.message}
            </p>
          )}
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
              className={`border ${errors.supplierPrice ? "border-red-500" : "border-black"} rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold`}
              type="number"
              min={0}
              id="supplierPrice"
              {...register("supplierPrice")}
            />
            {errors.supplierPrice && (
              <p className="text-red-500 text-xs font-bold">
                {errors.supplierPrice.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="shopPrice"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1"
            >
              Shop Price (PHP)
            </label>
            <input
              className={`border ${errors.shopPrice ? "border-red-500" : "border-black"} rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold`}
              type="number"
              min={0}
              id="shopPrice"
              step="any"
              {...register("shopPrice")}
            />
            {errors.shopPrice && (
              <p className="text-red-500 text-xs font-bold">
                {errors.shopPrice.message}
              </p>
            )}
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
              className={`border ${errors.shippingPrice ? "border-red-500" : "border-black"} rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold`}
              type="number"
              min={0}
              id="shippingPrice"
              {...register("shippingPrice")}
            />
            {errors.shippingPrice && (
              <p className="text-red-500 text-xs font-bold">
                {errors.shippingPrice.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="quantity"
              className="font-black uppercase text-[10px] tracking-widest text-gray-500 ml-1"
            >
              Quantity
            </label>
            <input
              className={`border ${errors.quantity ? "border-red-500" : "border-black"} rounded-[5px] p-2 outline-none bg-gray-50 focus:bg-white transition-colors font-mono font-bold`}
              type="number"
              id="quantity"
              min={0}
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs font-bold">
                {errors.quantity.message}
              </p>
            )}
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
