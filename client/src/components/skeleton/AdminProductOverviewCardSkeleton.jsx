const AdminProductOverviewCardSkeleton = () => {
  return (
    <div className="border border-gray-200 w-full flex flex-col gap-3 items-center justify-center rounded-[5px] relative p-4 bg-white animate-pulse h-full">
      {/* Badge Placeholder */}
      <div className="absolute -top-4 -left-3 bg-gray-300 w-24 h-6 rounded-[5px] transform rotate-1 z-20 border border-gray-300"></div>

      {/* Pin Placeholder */}
      <div className="w-6 h-6 bg-gray-200 absolute right-3 top-3 rounded-full border border-gray-300"></div>

      {/* Image Placeholder */}
      <div className="border border-gray-200 p-2 bg-gray-50 mt-4">
        <div className="w-[80px] h-[80px] bg-gray-200"></div>
      </div>

      {/* Info Placeholder */}
      <div className="p-2 flex flex-col gap-3 w-full items-center">
        <div className="w-24 h-5 bg-gray-200 rounded-sm"></div>
        <div className="w-full h-8 bg-gray-300 rounded-[5px]"></div>
      </div>
    </div>
  );
};
export default AdminProductOverviewCardSkeleton;
