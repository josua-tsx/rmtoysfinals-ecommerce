import { IoIosClose } from "react-icons/io";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";
import {  useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminOrderRestockModal({singleStock, onClose}) {
  const [productId, setProductId] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierPrice, setSupplierPrice] = useState(0);
  const [shopPrice, setShopPrice] = useState(0);
  const [shippingPrice, setShippingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const queryClient = useQueryClient()


  useEffect(() => {
    if (singleStock) {
      setProductId(singleStock?.product._id)
      setSupplier(singleStock?.supplier._id)
      setSupplierPrice(singleStock?.supplierPrice)
      setShopPrice(singleStock?.shopPrice)
      setShippingPrice(singleStock?.shippingPrice)
      setTotalCost(singleStock?.totalCost)
    }
  }, [singleStock])

  const {mutate: reOrderStockMutation} = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(`/stocks/reOrder-stock/${singleStock?._id}`, data)
      return res.data
    },
    onSuccess: () => {
      toast.success("success")
      queryClient.invalidateQueries({queryKey: ["stocks"]})
      onClose()
    },
    onError: (err) => {
      toast.error(err.response.data.message || "something went wrong")
    }
  })

  const hanldeFormSubmit = (e) => {
    e.preventDefault()

    reOrderStockMutation({
      productId,
      supplier,
      supplierPrice,
      shopPrice,
      shippingPrice,
      quantity,
      totalCost
    })
  }

  return (
    <section className="fixed inset-0 z-50 backdrop-blur-sm p-3">
      <div className="h-screen flex flex-col justify-center items-center mx-auto">
        <form
          onSubmit={hanldeFormSubmit}
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
                value={singleStock?.product?.productName}
                disabled
              />
            </div>

            <div className="flex gap-4">
              <label htmlFor="">Supplier: </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={singleStock?.supplier?.supplierName}
                disabled
              />
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

            <div className="flex gap-4">
              <p>Total Cost: </p>
              <p>{totalCost}</p>
            </div>
          </div>

          <button 
          className="bg-primary text-card p-2 rounded-bl-[5px] rounded-br-[5px]">
            Order
          </button>
        </form>
      </div>
    </section>
  );
}
