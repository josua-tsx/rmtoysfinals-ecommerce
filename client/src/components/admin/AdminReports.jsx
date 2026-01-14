import { useState } from "react";
import { HiDownload, HiDocumentReport } from "react-icons/hi";
import { FaFileInvoiceDollar, FaBoxes, FaClipboardList } from "react-icons/fa";
import axiosInstance from "../../lib/axios";
import toast from "react-hot-toast";

export default function AdminReports() {
  const [isDownloading, setIsDownloading] = useState({
    sales: false,
    orders: false,
    inventory: false,
  });

  const handleDownloadReport = async (type) => {
    setIsDownloading((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await axiosInstance.get(`/report/${type}`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type.charAt(0).toUpperCase() + type.slice(1)}-Report-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Report downloaded!`
      );
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report. Please try again.");
    } finally {
      setIsDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const reports = [
    {
      id: "sales",
      title: "Sales Report",
      description: "Revenue, orders, and sales analytics",
      icon: FaFileInvoiceDollar,
      color: "bg-green-500",
      shadowColor: "rgba(21, 128, 61, 1)",
    },
    {
      id: "orders",
      title: "Orders Summary",
      description: "Order status breakdown and recent orders",
      icon: FaClipboardList,
      color: "bg-indigo-500",
      shadowColor: "rgba(67, 56, 202, 1)",
    },
    {
      id: "inventory",
      title: "Inventory Report",
      description: "Stock levels and low-stock alerts",
      icon: FaBoxes,
      color: "bg-amber-500",
      shadowColor: "rgba(180, 83, 9, 1)",
    },
  ];

  return (
    <div className="border border-black rounded-[5px] bg-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary text-white rounded-[5px] border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <HiDocumentReport size={24} />
        </div>
        <div>
          <h2 className="font-black uppercase tracking-widest text-lg">
            Download Reports
          </h2>
          <p className="text-xs text-gray-500">
            Generate and download PDF reports
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="border border-black rounded-[5px] bg-white p-5 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-3 ${report.color} text-white rounded-[5px] border border-black`}
              >
                <report.icon size={20} />
              </div>
              <div>
                <h3 className="font-black uppercase text-sm">{report.title}</h3>
                <p className="text-[10px] text-gray-500">
                  {report.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownloadReport(report.id)}
              disabled={isDownloading[report.id]}
              className={`w-full ${report.color} text-white border border-black py-2.5 rounded-[5px] font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_${report.shadowColor}] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{
                boxShadow: `3px 3px 0px 0px ${report.shadowColor}`,
              }}
            >
              {isDownloading[report.id] ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <HiDownload size={16} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
