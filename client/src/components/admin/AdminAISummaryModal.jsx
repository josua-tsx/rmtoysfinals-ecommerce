import { SiGooglegemini } from "react-icons/si";
import {
  FaChartLine,
  FaLightbulb,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function AdminAISummaryModal({ show, onClose, data }) {
  if (!show || !data) return null;

  // Helper to determine status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "positive":
        return <FaArrowUp className="text-green-600" />;
      case "negative":
        return <FaArrowDown className="text-red-600" />;
      default:
        return <FaMinus className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "positive":
        return "bg-green-50 text-green-700 border-green-200";
      case "negative":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-black rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto  flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm border border-violet-100">
              <SiGooglegemini size={24} className="text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wide text-gray-800">
                Business Intelligence
              </h2>
              <p className="text-xs text-violet-600 font-bold uppercase tracking-wider">
                AI-Powered Analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group p-2 hover:bg-red-50 rounded-full transition-colors"
          >
            <IoClose
              size={24}
              className="text-gray-400 group-hover:text-red-500 transition-colors"
            />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* 1. Overview Section */}
          <section>
            <h3 className="text-sm font-black uppercase text-gray-400 mb-3 tracking-wider">
              Executive Summary
            </h3>
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100 text-gray-800 text-lg leading-relaxed font-medium">
              &quot;{data.overview}&quot;
            </div>
          </section>

          {/* 2. Key Metrics Grid */}
          <section>
            <h3 className="text-sm font-black uppercase text-gray-400 mb-3 tracking-wider flex items-center gap-2">
              <FaChartLine /> Key Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.keyMetrics?.map((metric, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${getStatusColor(
                    metric.status
                  )} hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black uppercase opacity-70">
                      {metric.label}
                    </span>
                    {getStatusIcon(metric.status)}
                  </div>
                  <div className="text-2xl font-black mb-1">{metric.value}</div>
                  <p className="text-xs font-medium opacity-90 leading-snug">
                    {metric.insight}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Trends Analysis */}
          <section className="bg-gray-50 p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-black uppercase text-gray-400 mb-2 tracking-wider">
              Trend Analysis
            </h3>
            <p className="text-gray-700 leading-relaxed">{data.trends}</p>
          </section>

          {/* 4. Actionable Recommendations */}
          <section>
            <h3 className="text-sm font-black uppercase text-gray-400 mb-3 tracking-wider flex items-center gap-2">
              <FaLightbulb className="text-yellow-500" /> Recommended Actions
            </h3>
            <div className="space-y-3">
              {data.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="mt-1">
                    <FaCheckCircle className="text-violet-600" size={16} />
                  </div>
                  <p className="text-gray-700 font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Generated by Google Gemini Flash 2.0
          </p>
        </div>
      </div>
    </div>
  );
}
