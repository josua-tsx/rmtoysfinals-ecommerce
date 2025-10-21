import { useQuery } from "@tanstack/react-query";
import AdminHighStock from "../../components/admin/AdminHighStock";
import AdminLowStocks from "../../components/admin/AdminLowStocks";
import AdminMediumStock from "../../components/admin/AdminMediumStock";
import AdminOutOfStocks from "../../components/admin/AdminOutOfStocks";
import AdminProductOverview from "../../components/admin/AdminProductOverview";
import AdminSalesOverview from "../../components/admin/AdminSalesOverview";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import LoadingSpinner from "../../reusable/LoadingSpinner";

export default function AdminOverview() {
  const {
    data: stocksLevels,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["stockLevels"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/get-stocks-levels`);
      return res.data;
    },
  });

  const highStockLevel = stocksLevels?.highStock || [];
  const mediumStockLevel = stocksLevels?.mediumStock || [];
  const lowStockLevel = stocksLevels?.lowStock || [];
  const outOfStockLevel = stocksLevels?.outOfStock || [];

  if (isError) return <p>Error.</p>;

  return (
    <section className="bg-yellow h-screen ">
      <AdminHeader title={"Overview"} />
      <div className="max-w-[90%]  py-14 mx-auto flex gap-10 flex-col">
        <div>
          <div className="absolute -top-11 -left-1 border rounded-[5px]  bg-primary text-card border-black p-1">
            <h1>STOCKS LEVELS</h1>
          </div>
          <div>
            {isPending ? (
              <div className="h-[150px] flex justify-center flex-col items-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 relative mt-4">
                <AdminHighStock stock={highStockLevel} />
                <AdminMediumStock stock={mediumStockLevel} />
                <AdminLowStocks stock={lowStockLevel} />
                <AdminOutOfStocks stock={outOfStockLevel} />
              </div>
            )}
          </div>
        </div>

        <AdminSalesOverview />
        <AdminProductOverview />
      </div>
    </section>
  );
}
