import { useState } from "react";
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
      const res = await axiosInstance.get(`/stocks/get-stocks-levels`);
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
        error.response?.data?.message || "Failed to generate summary"
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
        className="fixed top-20 right-6 z-50 bg-primary text-card p-3 rounded-full border-2 border-black shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
        title="Generate AI Dashboard Summary"
      >
        {summaryLoading ? (
          <div className="animate-spin h-6 w-6 border-2 border-card border-t-transparent rounded-full" />
        ) : (
          <SiGooglegemini size={24} />
        )}
      </button>

      {/* Summary Modal */}
      {showSummaryModal && summaryData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-card border-2 border-black rounded-[5px] max-w-3xl w-full max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <SiGooglegemini size={28} className="text-primary" />
                AI Dashboard Summary
              </h2>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-2xl font-bold hover:text-primary transition-colors"
              >
                ×
              </button>
            </div>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {summaryData.summary}
              </div>
            </div>
          </div>
        </div>
      )}

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
