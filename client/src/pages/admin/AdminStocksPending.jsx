import { useQuery } from "@tanstack/react-query";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import { useState } from "react";
import AdminOrderStocksModal from "./AdminOrderStocksModal";
import LoadingSpinner from "../../reusable/LoadingSpinner";
import { useUserStore } from "../../stores/useUserStore";

export default function AdminStocksPending() {

  const currentUser = useUserStore((state) => state.currentUser)

  const [orderSingleStock, setOrderSingleStock] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  const { data: singleOrderStock } = useQuery({
    queryKey: ["singleProduct", selectedId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/product/get-product/${selectedId}`);
      return res.data;
    },
  });

  const handleOpenSingleOrder = (product) => {
    setOpenModal(true);
    setSelectedId(product._id);
    setOrderSingleStock(product);
  };

  const handleCloseSingleOrder = () => {
    setOpenModal(false);
    setSelectedId(null);
  };

 
  if (isProductsError) {
    return <p>loading...</p>;
  }

  return (
    <section className="bg-yellow h-screen font-main">
      <AdminHeader title={"PENDING STOCKS"} />

      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-5 flex-col">
        {openModal && singleOrderStock && (
          <AdminOrderStocksModal
            singleOrder={orderSingleStock}
            onClose={() => handleCloseSingleOrder()}
          />
        )}

        <div className="relative border border-black flex flex-col rounded-[5px] w-full md:w-[70%] h-full mx-auto bg-card">
          <div className="absolute bg-card -top-7 right-0 w-[80px] border border-black h-[20px] rounded-full"></div>

          <div className="p-4 flex flex-col gap-4">
            {
              isProductsPending ? (
                <div className="flex justify-center">
                  <LoadingSpinner/>
                </div>
              ) : (
                products.length > 0 ? (
                  products.map((product) => (
                    <div key={product._id} className="flex items-center gap-4">
                      <img
                        src={product?.productImages[0]}
                        alt=""
                        className="h-[50px] w-[50px] object-cover rounded-[5px]"
                      />
                      <div className="flex justify-between w-full items-center">
                        <div className="flex gap-4">
                          <div className="flex gap-2 items-center">
                            <p className="text-blue-700">Product Name: </p>
                            <p>{product?.productName}</p>
                          </div>
                          <div className="hidden md:flex md:gap-4">
                            <div className="flex gap-2 items-center">
                              <p className="text-blue-700">Description: </p>
                              <p>{product?.productDescription}</p>
                            </div>
    
                            <div className="flex gap-2 items-center">
                              <p className="text-blue-700">Category: </p>
                              <p>{product?.category?.categoryName}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <button
                          disabled={currentUser.role === "validatorStaff"}
                            onClick={() => handleOpenSingleOrder(product)}
                            className={` ${currentUser.role === "validatorStaff" ? "hidden" : "block"} border bg-primary rounded-[5px] text-white p-1 border-black`}
                          >
                            Order Stock
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No Pendings</p>
                )
              )
            }
          </div>
        </div>
      </div>
    </section>
  );
}
