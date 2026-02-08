import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import AdminStocksTable from "../../components/admin/AdminStocksTable";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import formatPrice from "../../reusable/formatPrice";
import AdminStatCardSkeleton from "../../components/skeleton/AdminStatCardSkeleton";
import AdminTableSkeleton from "../../components/skeleton/AdminTableSkeleton";

export default function AdminStocks() {
  const {
    data: stocks = [],
    isLoading: isStocksPending,
    isError: isStocksError,
  } = useQuery({
    queryKey: ["stocks"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/get-stock`);
      return res.data;
    },
  });

  const totalExpectedRevenue = Array.isArray(stocks)
    ? stocks.reduce((total, item) => {
        return total + item?.shopPrice * item?.quantity;
      }, 0)
    : 0;

  const totalExpectedExpenses = Array.isArray(stocks)
    ? stocks.reduce((total, item) => {
        return total + item?.totalCost;
      }, 0)
    : 0;

  const totalExpectedProfit = totalExpectedRevenue - totalExpectedExpenses;

  const totalExpectedVatToRemit = Array.isArray(stocks)
    ? stocks.reduce((total, item) => {
        return total + item?.vatToRemit;
      }, 0)
    : 0;

  return (
    <section className="bg-yellow h-screen">
      <AdminHeader title={"Stocks"} />
      <div className="max-w-[90%] pt-14 pb-5 mx-auto flex gap-10 flex-col">
        {/* main */}

        {isStocksPending ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
              {Array.from({ length: 4 }).map((_, index) => (
                <AdminStatCardSkeleton key={index} />
              ))}
            </div>
            <div className="font-main border text-sm md:text-normal rounded-[5px] border-black bg-card relative mt-6 overflow-visible p-4">
              <AdminTableSkeleton />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-2 md:gap-5 relative font-main">
              <AdminStatCard
                title={"TOTAL EXPECTED REVENUE WITHOUT VAT"}
                value={`${formatPrice(totalExpectedRevenue)} PHP`}
              />
              <AdminStatCard
                title={"TOTAL EXPECTED EXPENSES"}
                value={`${formatPrice(totalExpectedExpenses)} PHP`}
              />
              <AdminStatCard
                title={"TOTAL EXPECTED VAT TO REMIT"}
                value={`${formatPrice(totalExpectedVatToRemit)} PHP`}
              />
              <AdminStatCard
                title={"TOTAL EXPECTED PROFIT WITHOUT VAT"}
                value={`${formatPrice(totalExpectedProfit)} PHP`}
              />
            </div>

            <AdminStocksTable
              stocks={stocks}
              isStocksPending={isStocksPending}
              isStocksError={isStocksError}
            />
          </>
        )}
      </div>
    </section>
  );
}
