import { useState } from "react";
import { FaChartLine, FaClock } from "react-icons/fa";
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
import AdminStatCardSkeleton from "../skeleton/AdminStatCardSkeleton.jsx";
import AdminChartSkeleton from "../skeleton/AdminChartSkeleton.jsx";

export default function AdminSalesOverview() {
  const [chartView, setChartView] = useState("monthly");
  const {
    data: rawAnalyticsData,
    isPending: isAnalyticsPending,
    isError: isAnalyticsError,
  } = useQuery({
    queryKey: ["salesAnalytics"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/analytics`);
      return res.data;
    },
  });

  // Defensive: ensure all sub-fields are arrays even if API omits them
  const analyticsData = {
    daily: Array.isArray(rawAnalyticsData?.daily) ? rawAnalyticsData.daily : [],
    weekly: Array.isArray(rawAnalyticsData?.weekly)
      ? rawAnalyticsData.weekly
      : [],
    thirtyDays: Array.isArray(rawAnalyticsData?.thirtyDays)
      ? rawAnalyticsData.thirtyDays
      : [],
    monthly: Array.isArray(rawAnalyticsData?.monthly)
      ? rawAnalyticsData.monthly
      : [],
    yearly: Array.isArray(rawAnalyticsData?.yearly)
      ? rawAnalyticsData.yearly
      : [],
  };

  // GET TOTAL VAT TO REMIT FROM SUCCESS ORDER
  const { data: successOrderData } = useQuery({
    queryKey: ["successOrder"],
    queryFn: async () => {
      // Fetch all success orders (high limit) to calculate total revenue/VAT
      const res = await axiosInstance.get(
        `/order/get-successOrder?limit=1000000`,
      );
      return res.data;
    },
  });

  const successOrders = Array.isArray(successOrderData?.orders)
    ? successOrderData.orders
    : [];

  // Calculate total VAT to remit
  const totalVatToRemit = successOrders.reduce((totalVat, order) => {
    const orderItems = Array.isArray(order.orderItems) ? order.orderItems : [];
    const orderVat =
      orderItems.reduce((orderTotal, item) => {
        if (!item?.productId) return orderTotal;
        const vatPerUnit = item.productId.price - item.productId.preVatPrice;
        return orderTotal + vatPerUnit * item.quantity;
      }, 0) || 0;

    return totalVat + orderVat;
  }, 0);

  // TOTAL CUSTOMER
  const {
    data: customerData,
    isPending: isCustomerPending,
    isError: isCustomerError,
  } = useQuery({
    queryKey: ["totalCustomer"],
    queryFn: async () => {
      // Limit 1 is enough to get the total count from metadata
      const res = await axiosInstance.get(`/user/getAllCustomer?limit=1`);
      return res.data;
    },
  });

  const totalCustomerCount = customerData?.total || 0;

  // GET ALL WORKERS
  const { data: workerData } = useQuery({
    queryKey: ["totalWorkers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/user/getAllWorkers?limit=1`);
      return res.data;
    },
  });

  const totalWorkerCount = workerData?.total || 0;

  // GET TOTAL COST IN STOCKS

  const {
    data: stocksData,
    isLoading: isStocksPending,
    isError: isStocksError,
  } = useQuery({
    queryKey: ["stocks", "salesOverviewStats"],
    queryFn: async () => {
      // Need all stocks to sum up total cost
      const res = await axiosInstance.get(`/stocks/get-stocks?limit=1000000`);
      return res.data;
    },
  });

  const stockList = Array.isArray(stocksData?.stocks) ? stocksData.stocks : [];

  const totalExpenses = stockList.reduce((total, item) => {
    return total + (item?.totalCost || 0);
  }, 0);

  // GET ALL ORDERS (PENDING SO ON)

  const {
    data: allPendings = [],
    isPending: isPendingPending,
    isError: isPendingError,
  } = useQuery({
    queryKey: ["Pendings"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/order/get-all-orders`);
      return res.data;
    },
  });

  const totalRevenue = successOrders.reduce((sum, item) => {
    return sum + (item.totalPrice || 0);
  }, 0);

  // Helper to get sales for a specific date (YYYY-MM-DD)
  const getSalesForDate = (dateStr) => {
    const dailyData = Array.isArray(analyticsData.daily)
      ? analyticsData.daily
      : [];
    const entry = dailyData.find((d) => d._id === dateStr);
    return entry ? entry.totalSales : 0;
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const todaySales = getSalesForDate(todayStr);
  const yesterdaySales = getSalesForDate(yesterdayStr);

  // Helper to generate last N days as YYYY-MM-DD strings
  const getLastNDays = (n) => {
    const days = [];
    const today = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  // Helper to generate last 5 years (YYYY)
  const getLast5Years = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      years.unshift((currentYear - i).toString());
    }
    return years;
  };

  const processChartData = (view) => {
    if (view === "weekly") {
      const last7Days = getLastNDays(7);
      return last7Days.map((day) => {
        const found = (analyticsData.weekly || []).find((d) => d._id === day);
        return {
          _id: day,
          totalSales: found ? found.totalSales : 0,
        };
      });
    } else if (view === "thirtyDays") {
      const last30Days = getLastNDays(30);
      return last30Days.map((day) => {
        const found = (analyticsData.thirtyDays || []).find(
          (d) => d._id === day,
        );
        return {
          _id: day,
          totalSales: found ? found.totalSales : 0,
        };
      });
    } else if (view === "monthly") {
      return Array.isArray(analyticsData.monthly) ? analyticsData.monthly : [];
    } else {
      const last5Years = getLast5Years();
      return last5Years.map((year) => {
        const found = (analyticsData.yearly || []).find((d) => d._id === year);
        return {
          _id: year,
          totalSales: found ? found.totalSales : 0,
        };
      });
    }
  };

  // Color map for each chart view
  const chartColors = {
    weekly: "#f59e0b",
    thirtyDays: "#8b5cf6",
    monthly: "#22c55e",
    yearly: "#3b82f6",
  };

  const chartData = processChartData(chartView);

  if (isAnalyticsError || isCustomerError || isPendingError || isStocksError)
    return <p>loading...</p>;

  return (
    <div className="flex flex-col bg-yellow gap-20">
      <div className=" grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
        <AdminStatCard
          title={"TODAY SALES"}
          value={`${formatPrice(todaySales)} PHP`}
          value2={`yesterday sales + ${formatPrice(yesterdaySales)} PHP`}
        />

        <AdminStatCard
          title={"TOTAL REVENUE"}
          value={`${formatPrice(totalRevenue)} PHP`}
        />

        {isStocksPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard
            title={"TOTAL EXPENSES"}
            value={`${formatPrice(totalExpenses)} PHP`}
          />
        )}

        {isPendingPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard
            title={"TOTAL VAT TO REMIT"}
            value={`${formatPrice(totalVatToRemit)} PHP`}
          />
        )}

        {isPendingPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard
            title={"TOTAL PROFIT"}
            value={`${formatPrice(
              Math.max(0, totalRevenue - totalExpenses),
            )} PHP`}
          />
        )}

        {isCustomerPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard
            title={"TOTAL CUSTOMERS"}
            value={totalCustomerCount}
            value2={`TOTAL WORKERS ${totalWorkerCount}`}
          />
        )}

        {isPendingPending ? (
          <AdminStatCardSkeleton />
        ) : (
          <AdminStatCard
            title={"TOTAL PENDING ORDERS"}
            value={`${Array.isArray(allPendings) ? allPendings.length : allPendings?.total || 0}`}
          />
        )}
      </div>

      <div className="flex w-full flex-col md:flex-row gap-20 md:gap-4">
        <div className="flex flex-col  w-full md:w-[70%] gap-8 relative overflow-visible">
          {/* Sales Overview Header */}
          <div className="absolute -top-4 -left-3 bg-[#22c55e] text-white border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
            <h2 className="font-black uppercase tracking-widest text-sm  flex items-center gap-2">
              <span className="text-lg">
                <FaChartLine />
              </span>{" "}
              Sales Overview
            </h2>
          </div>

          {/* Sales Chart with Toggle */}
          <div className="p-6 pt-10 w-full h-[500px] relative bg-card border border-black rounded-[5px]">
            <div className="flex flex-wrap absolute top-2 right-2 gap-2 mb-4">
              {[
                { key: "weekly", label: "Weekly" },
                { key: "thirtyDays", label: "30 Days" },
                { key: "monthly", label: "Monthly" },
                { key: "yearly", label: "Yearly" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setChartView(btn.key)}
                  className={`border rounded-[5px] px-4 py-2 font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                    chartView === btn.key
                      ? "bg-primary text-white border-black"
                      : "bg-white text-black border-black hover:bg-gray-100"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {isAnalyticsPending ? (
              <AdminChartSkeleton />
            ) : chartData.length === 0 ? (
              <p className="p-4">No data available for the chart</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="_id"
                    stroke="#000"
                    tick={{ fill: "#000", fontSize: 12, fontWeight: "bold" }}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                    tickLine={{ stroke: "#000", strokeWidth: 2 }}
                  />
                  <YAxis
                    stroke="#000"
                    domain={[0, "auto"]}
                    tick={{ fill: "#000", fontSize: 12, fontWeight: "bold" }}
                    axisLine={{ stroke: "#000", strokeWidth: 2 }}
                    tickLine={{ stroke: "#000", strokeWidth: 2 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #000",
                      boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
                      borderRadius: "5px",
                    }}
                    itemStyle={{ color: "#000", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    stroke={chartColors[chartView]}
                    strokeWidth={3}
                    dot={{
                      fill: chartColors[chartView],
                      stroke: "#000",
                      strokeWidth: 2,
                      r: 6,
                    }}
                    activeDot={{ r: 8, stroke: "#000", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="w-full md:w-[30%] flex flex-col gap-6 relative overflow-visible">
          {/* Recent Activity Header */}
          <div className="absolute -top-4 -left-3 bg-[#22c55e] text-white border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
            <h2 className="font-black uppercase tracking-widest text-sm  flex items-center gap-2">
              <span className="text-lg">
                <FaClock />
              </span>{" "}
              Recent Activity
            </h2>
          </div>
          <div className="bg-card border h-full border-black rounded-[5px] p-6 pt-10 flex flex-col gap-4">
            <AdminRecentSuccessOrder />
            <AdminRecentFailedOrder />
            <AdminRecentRefundedOrder />
            <AdminRecentCancelledOrder />
          </div>
        </div>
      </div>
    </div>
  );
}
