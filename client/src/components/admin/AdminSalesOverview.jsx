import { useQuery } from "@tanstack/react-query";
import AdminStatCard from "./AdminStatCard";
import axiosInstance from "../../lib/axios";
import formatPrice from "../../reusable/formatPrice.js";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AdminRecentSuccessOrder from "./AdminRecentSuccessOrder.jsx";
import AdminRecentFailedOrder from "./AdminRecentFailedOrder.jsx";
import AdminRecentRefundedOrder from "./AdminRecentRefundedOrder.jsx";
import AdminRecentCancelledOrder from "./AdminRecentCancelledOrder.jsx";

export default function AdminSalesOverview() {
  const {
    data: monthlySales = [],
    isPending: isMonthlyPending,
    isError: isMonthlyError,
  } = useQuery({
    queryKey: ["monthlySales"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/monthly/sales`);
      return res.data.map((item) => ({
        ...item,
        totalSales: item.totalSales,
      }));
    },
  });

  const {
    data: successOrderData = [],
    isPending: isSuccessPending,
    isError: isSuccessError,
  } = useQuery({
    queryKey: ["successOrder"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-successOrder`);
      return res.data;
    },
  });

  // TOTAL CUSTOMER

  const {
    data: totalCustomer = [],
    isPending: isCustomerPending,
    isError: isCustomerError,
  } = useQuery({
    queryKey: ["totalCustomer"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/user/getAllCustomer`);
      return res.data;
    },
  });

  // GET ALL WORKERS
  const {
    data: totalWorkers = [],
    isPending: isWorkersPending,
    isError: isWorkersError,
  } = useQuery({
    queryKey: ["totalWorkers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/user/getAllWorkers`);
      return res.data;
    },
  });
  
  // GET ALL ORDERS (PENDING SO ON)

  const {data: allPendings = [], isPending: isPendingPending, isError: isPendingError} = useQuery({
    queryKey: ['Pendings'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-orders`)
      return res.data
    }
  })


  const totalRevenue = successOrderData.reduce((sum, item) => {
    return sum + item.totalPrice;
  }, 0);

  function getDailySales(orders) {
    const dailySales = {};

    orders.forEach((order) => {
      // Parse the date (ignore the time part)
      const date = new Date(order.createdAt).toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Initialize the daily sales entry for this date if it doesn't exist
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }

      // Add the order's totalPrice to the daily sales
      dailySales[date] += order.totalPrice;
    });

    // Convert the daily sales object to an array of {date, totalSales}
    const dailySalesArray = Object.keys(dailySales)?.map((date) => ({
      date,
      totalSales: dailySales[date],
    }));

    return dailySalesArray;
  }

  // Get daily sales
  const dailySales = getDailySales(successOrderData);

  if (
    isMonthlyPending ||
    isSuccessPending ||
    isCustomerPending ||
    isWorkersPending ||
    isPendingPending || 
    isPendingError
  )
    return <p>loading...</p>;
  if (isMonthlyError || isSuccessError || isCustomerError || isWorkersError)
    return <p>loading...</p>;

  return (
    <div className="flex flex-col gap-16">
      <div className=" grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
        <AdminStatCard
          title={"TODAY SALES"}
          value={
            successOrderData.length > 0
              ? `${formatPrice(dailySales[0]?.totalSales)} PHP`
              : 0
          }
          value2={
            successOrderData.length > 0
              ? `yesterday sales + ${formatPrice(
                  dailySales[1]?.totalSales
                )} PHP`
              : 0
          }
        />
        <AdminStatCard
          title={"TOTAL REVENUE"}
          value={`${formatPrice(totalRevenue)} PHP`}
        />
        <AdminStatCard
          title={"TOTAL CUSTOMER"}
          value={totalCustomer?.length > 0 ? totalCustomer?.length : 0}
          value2={`TOTAL WORKERS ${
            totalWorkers.length > 0 ? totalWorkers?.length : 0
          }`}
        />
        <AdminStatCard
          title={"TOTAL PENDING ORDERS"}
          value={`${allPendings.length > 0 ? allPendings.length : 0}`}
        />
      </div>

      <div className="flex w-full flex-col md:flex-row  gap-20 md:gap-4">
        <div className=" p-2 w-full h-[500px] relative md:w-[70%] bg-card border border-black rounded-[5px]">
          <div className="absolute -top-11 -left-1 border rounded-[5px]  bg-primary text-card border-black p-1">
            <h1>MONTHLY SALES</h1>
          </div>

          {monthlySales.length === 0 ? (
            <p>No data available for the chart</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.8)",
                    borderColor: "#4B5563",
                  }}
                  itemStyle={{ color: "#E5E7EB" }}
                />
                <Line
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ fill: "#6366F1", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="w-full md:w-[30%] flex flex-col gap-14  rounded-[5px] relative ">
          <AdminRecentSuccessOrder />
          <AdminRecentFailedOrder />
          <AdminRecentRefundedOrder />
          <AdminRecentCancelledOrder />
        </div>
      </div>
    </div>
  );
}
