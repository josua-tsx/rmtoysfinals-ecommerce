import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import formatPrice from "../../reusable/formatPrice";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminRecentFailedOrder() {
  const navigate = useNavigate();

  const {
    data: latestfailedOrder = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["latestfailedOrder"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/latest/failed`);
      return res.data;
    },
  });

  console.log(latestfailedOrder);

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Loading...</p>;

  return (
    <div className="flex-1">
      {isPending ? (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner />
        </div>
      ) : latestfailedOrder ? (
        <div className="bg-card border h-full flex items-center justify-between relative border-black rounded-[5px] p-2">
          <div className="absolute -top-11 -left-1 border rounded-[5px]  bg-primary text-card border-black p-1">
            <h1>RECENT FAILED </h1>
          </div>

          <div className="flex items-center gap-2">
            {latestfailedOrder?.orderItems.length > 1 ? (
              <img
                src={latestfailedOrder.imageUrl}
                alt="product image"
                className="w-[50px]"
              />
            ) : (
              <img
                src={
                  latestfailedOrder?.orderItems[0].productId.productImages[0]
                }
                alt="product image"
                className="w-[50px]"
              />
            )}
            <div className="text-xs">
              {latestfailedOrder?.orderItems.length > 1 ? (
                <div className="flex flex-col gap-1">
                  <p>items ({latestfailedOrder?.orderItems.length})</p>
                  <p className="uppercase text-indigo-700">
                    {latestfailedOrder?.paymentMethod}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="uppercase truncate w-[50px]">
                    {latestfailedOrder?.orderItems[0].productId.productName}
                  </p>
                  <p className="uppercase text-indigo-700">
                    {latestfailedOrder.paymentMethod}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex text-xs flex-col gap-1">
            <p className="text-red-700">{latestfailedOrder.paymentStatus}</p>
            <p>+ {formatPrice(latestfailedOrder.totalPrice)} PHP</p>
          </div>
          <div className="text-xs flex flex-col gap-1">
            <button
              onClick={() => navigate(`/admin/orderTransactions`)}
              className="underline text-indigo-700"
            >
              redirect to order
            </button>
            <p>{new Date(latestfailedOrder.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <p className="border border-black rounded-[5px] bg-card p-5">
          no failed order yet.
        </p>
      )}
    </div>
  );
}
