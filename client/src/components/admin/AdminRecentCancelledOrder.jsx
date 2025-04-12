import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import formatPrice from "../../reusable/formatPrice";

export default function AdminRecentCancelledOrder() {
  const navigate = useNavigate();

  const {
    data: latestcancelledOrder = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["latestcancelledOrder"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/latest/cancelled`);
      return res.data;
    },
  });

  console.log(latestcancelledOrder);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Loading...</p>;

  return (
    <div className="flex-1">
      {latestcancelledOrder ? (
        <div className="bg-card h-full border flex items-center justify-between relative border-black rounded-[5px] p-2">
          <div className="absolute -top-11 -left-1 border rounded-[5px]  bg-primary text-card border-black p-1">
            <h1>RECENT CANCELLED </h1>
          </div>

          <div className="flex items-center gap-2">
            {latestcancelledOrder?.orderItems?.length > 1 ? (
              <img
                src={latestcancelledOrder.imageUrl}
                alt="product image"
                className="w-[50px]"
              />
            ) : (
              <img
                src={
                  latestcancelledOrder?.orderItems[0].productId.productImages[0]
                }
                alt="product image"
                className="w-[50px]"
              />
            )}
            <div className="text-xs">
              {latestcancelledOrder?.orderItems.length > 1 ? (
                <div className="flex flex-col gap-1">
                  <p>items ({latestcancelledOrder?.orderItems.length})</p>
                  <p className="uppercase text-indigo-700">
                    {latestcancelledOrder.paymentMethod}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="uppercase truncate w-[50px]">
                    {latestcancelledOrder?.orderItems[0].productId.productName}
                  </p>
                  <p className="uppercase text-indigo-700">
                    {latestcancelledOrder.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex text-xs flex-col gap-1">
            <p className="text-red-700">{latestcancelledOrder.status}</p>
            <p>+ {formatPrice(latestcancelledOrder.totalPrice)} PHP</p>
          </div>
          <div className="text-xs flex flex-col gap-1">
            <button
              onClick={() => navigate(`/admin/orderTransact`)}
              className="underline text-indigo-700"
            >
              redirect to order
            </button>
            <p>{new Date(latestcancelledOrder.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <p className="border border-black rounded-[5px] bg-card p-5">
          no cancelled order.
        </p>
      )}
    </div>
  );
}
