import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import formatPrice from "../../reusable/formatPrice";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../stores/useUserStore";

import AdminRecentOrderSkeleton from "../skeleton/AdminRecentOrderSkeleton";

export default function AdminRecentSuccessOrder() {
  const navigate = useNavigate();

  const currentUser = useUserStore((state) => state.currentUser);

  const {
    data: latestOrder = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["latestSuccessOrder"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/latest/success`);
      return res.data;
    },
  });

  if (isError) return <p>Loading...</p>;

  return (
    <div className="flex-1">
      {isPending ? (
        <AdminRecentOrderSkeleton />
      ) : latestOrder ? (
        <div className="bg-card border h-full flex items-center justify-between relative border-black rounded-[5px] p-2">
          <div className="absolute -top-11 -left-1 border rounded-[5px]  bg-primary text-card border-black p-1">
            <h1>RECENT SUCCESS </h1>
          </div>

          <div className="flex items-center gap-2">
            {latestOrder.orderItems.length > 1 ? (
              <img
                src={latestOrder.imageUrl}
                alt="product image"
                className="w-[50px] hidden md:block"
              />
            ) : (
              <img
                src={latestOrder.orderItems[0].productId.productImages[0]}
                alt="product image"
                className="w-[50px] hidden md:block"
              />
            )}
            <div className="text-xs">
              {latestOrder.orderItems.length > 1 ? (
                <div className="flex flex-col gap-1">
                  <p>items ({latestOrder?.orderItems.length})</p>
                  <p className="uppercase text-indigo-700">
                    {latestOrder.paymentMethod}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="uppercase truncate w-[50px]">
                    {latestOrder.orderItems[0].productId.productName}
                  </p>
                  <p className="uppercase text-indigo-700">
                    {latestOrder.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex text-xs flex-col gap-1">
            <p className="text-indigo-700">{latestOrder.status}</p>
            <p>+ {formatPrice(latestOrder.totalPrice)} PHP</p>
          </div>
          <div className="text-xs flex flex-col gap-1">
            <button
              onClick={() =>
                navigate(
                  `${currentUser.role === "admin" ? `/admin/orderTransactions` : "/validator/orderTransactions"}`,
                )
              }
              className="underline text-indigo-700"
            >
              redirect to order
            </button>
            <p>{new Date(latestOrder.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <p className="border border-black rounded-[5px] bg-card p-5">
          no success order yet.
        </p>
      )}
    </div>
  );
}
