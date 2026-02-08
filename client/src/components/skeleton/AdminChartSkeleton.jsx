const AdminChartSkeleton = () => {
  return (
    <div className="w-full h-full p-4 animate-pulse flex items-center justify-center">
      <div className="w-full h-full bg-gray-50 rounded-[5px] border border-gray-200 relative p-4">
        {/* Fake Grid Lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-200"></div>
        <div className="absolute top-2/4 left-0 right-0 h-px bg-gray-200"></div>
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-200"></div>

        {/* Fake Line Path */}
        <svg
          className="absolute inset-0 w-full h-full text-gray-300"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 Q25,70 50,40 T100,20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        {/* Loading Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 px-4 py-2 rounded shadow-sm text-gray-400 text-sm font-bold uppercase tracking-widest">
            Loading Data...
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminChartSkeleton;
