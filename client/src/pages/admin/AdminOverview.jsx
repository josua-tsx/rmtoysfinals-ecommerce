import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminHighStock from "../../components/admin/AdminHighStock";
import AdminLowStocks from "../../components/admin/AdminLowStocks";
import AdminMediumStock from "../../components/admin/AdminMediumStock";
import AdminOutOfStocks from "../../components/admin/AdminOutOfStocks";
import AdminProductOverview from "../../components/admin/AdminProductOverview";
import AdminSalesOverview from "../../components/admin/AdminSalesOverview";
import AdminTopSellingProducts from "../../components/admin/AdminTopSellingProducts";
import AdminReports from "../../components/admin/AdminReports";
import AdminHeader from "../../reusable/Admin/AdminHeader";
import axiosInstance from "../../lib/axios";
import AdminAISummaryModal from "../../components/admin/AdminAISummaryModal";
import AdminStockCardSkeleton from "../../components/skeleton/AdminStockCardSkeleton";
import { SiGooglegemini } from "react-icons/si";

export default function AdminOverview() {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryError, setSummaryError] = useState(null);

  const {
    data: stocksLevels,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["stockLevels"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/stocks/get-stock-levels`);
      return res.data;
    },
  });

  const highStockLevel = stocksLevels?.highStock || [];
  const mediumStockLevel = stocksLevels?.mediumStock || [];
  const lowStockLevel = stocksLevels?.lowStock || [];
  const outOfStockLevel = stocksLevels?.outOfStock || [];

  const handleGeminiClick = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await axiosInstance.get("/gemini/dashboard-summary");
      setSummaryData(res.data);
      setShowSummaryModal(true);
    } catch (error) {
      setSummaryError(
        error.response?.data?.message || "Failed to generate summary",
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  if (isError) return <p>Error.</p>;

  return (
    <section className="bg-yellow h-screen ">
      <AdminHeader title={"Overview"} />

      {/* Gemini AI Summary Button */}
      <button
        onClick={handleGeminiClick}
        disabled={summaryLoading}
        className="fixed top-20 right-6 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 group"
        title="Generate AI Dashboard Summary"
      >
        {summaryLoading ? (
          <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
          <SiGooglegemini size={24} className="group-hover:animate-pulse" />
        )}
      </button>

      {/* Summary Modal */}
      <AdminAISummaryModal
        show={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        data={summaryData?.summary}
      />

      {/* Error Display */}
      {summaryError && (
        <div className="fixed top-32 right-6 bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-[5px] max-w-sm z-50">
          <p className="font-bold">Error</p>
          <p className="text-sm">{summaryError}</p>
          <button
            onClick={() => setSummaryError(null)}
            className="absolute top-2 right-2 text-xl"
          >
            ×
          </button>
        </div>
      )}
      <div className="max-w-[90%] py-14 mx-auto flex gap-10 flex-col">
        {/* Download Reports */}
        <AdminReports />

        {/* Inventory Status Panel */}
        <div className="relative mt-6">
          <div className="absolute -top-4 -left-3 bg-[#22c55e] text-white border border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-[5px] transform -rotate-1 z-20">
            <h1 className="font-black uppercase tracking-widest text-sm ">
              Inventory Status
            </h1>
          </div>
          <div className="bg-card border border-black rounded-[5px] p-8 pt-10">
            {isPending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 relative">
                {[...Array(4)].map((_, i) => (
                  <AdminStockCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 relative">
                <AdminHighStock stock={highStockLevel} />
                <AdminMediumStock stock={mediumStockLevel} />
                <AdminLowStocks stock={lowStockLevel} />
                <AdminOutOfStocks stock={outOfStockLevel} />
              </div>
            )}
          </div>
        </div>

        <AdminSalesOverview />
        <AdminTopSellingProducts />
        <AdminProductOverview />
      </div>
    </section>
  );
}
