const AdminStockCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 p-4 flex flex-col items-center justify-center gap-2 rounded-[5px] relative overflow-hidden animate-pulse h-[130px]">
      {/* Circle Placeholder */}
      <div className="absolute top-3 right-3 w-4 h-4 bg-gray-200 rounded-full"></div>

      {/* Label Placeholder */}
      <div className="w-24 h-3 bg-gray-200 rounded-sm"></div>

      {/* Value Placeholder */}
      <div className="w-12 h-8 bg-gray-300 rounded-sm mt-1"></div>

      {/* Sublabel Placeholder */}
      <div className="w-16 h-2 bg-gray-100 rounded-sm"></div>
    </div>
  );
};

export default AdminStockCardSkeleton;
