import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import formatPrice from "../../reusable/formatPrice";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminRecentRefundedOrder() {
  const navigate = useNavigate();

  const {
    data: latestrefundedOrder = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["latestrefundedOrder"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/latest/refunded`);
      return res.data;
    },
  });

  console.log(latestrefundedOrder);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Loading...</p>;

  return (
    <div className="flex-1">
      {isPending ? (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      ) : latestrefundedOrder ? (
        <div className="bg-card h-full border flex items-center justify-between relative border-black rounded-[5px] p-2">
          <div className="absolute -top-11 -left-1 border rounded-[5px]  bg-primary text-card border-black p-1">
            <h1>RECENT REFUNDED </h1>
          </div>

          <div className="flex items-center gap-2">
            {latestrefundedOrder?.orderItems.length > 1 ? (
              <img
                src={latestrefundedOrder.imageUrl}
                alt="product image"
                className="w-[50px]"
              />
            ) : (
              <img
                src={
                  latestrefundedOrder.orderItems[0].productId.productImages[0]
                }
                alt="product image"
                className="w-[50px]"
              />
            )}
            <div className="text-xs">
              {latestrefundedOrder.orderItems.length > 1 ? (
                <div className="flex flex-col gap-1">
                  <p>items ({latestrefundedOrder?.orderItems.length})</p>
                  <p className="uppercase text-indigo-700">
                    {latestrefundedOrder.paymentMethod}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="uppercase truncate w-[50px]">
                    {latestrefundedOrder.orderItems[0].productId.productName}
                  </p>
                  <p className="uppercase text-indigo-700">
                    {latestrefundedOrder.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex text-xs flex-col gap-1">
            <p className="text-red-700">{latestrefundedOrder.status}</p>
            <p>+ {formatPrice(latestrefundedOrder.totalPrice)} PHP</p>
          </div>
          <div className="text-xs flex flex-col gap-1">
            <button
              onClick={() => navigate(`/admin/orderTransactions`)}
              className="underline text-indigo-700"
            >
              redirect to order
            </button>
            <p>{new Date(latestrefundedOrder.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <p className="border border-black rounded-[5px] bg-card p-5">
          no refunded order yet.
        </p>
      )}
    </div>
  );
}
