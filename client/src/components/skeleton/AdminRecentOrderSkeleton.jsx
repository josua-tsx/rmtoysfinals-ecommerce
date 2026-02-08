const AdminRecentOrderSkeleton = () => {
  return (
    <div className="bg-white border h-20 flex items-center justify-between relative border-gray-200 rounded-[5px] p-2 animate-pulse w-full">
      {/* Badge Placeholder */}
      <div className="absolute -top-3 -left-1 w-24 h-5 bg-gray-300 rounded-[5px]"></div>

      <div className="flex items-center gap-2">
        {/* Image Placeholder */}
        <div className="w-[50px] h-[50px] bg-gray-200 rounded-sm"></div>
        {/* Text Placeholder */}
        <div className="flex flex-col gap-2">
          <div className="w-20 h-3 bg-gray-200 rounded-sm"></div>
          <div className="w-12 h-2 bg-gray-100 rounded-sm"></div>
        </div>
      </div>

      {/* Right side Text Placeholder */}
      <div className="flex flex-col gap-2 items-end">
        <div className="w-16 h-3 bg-gray-200 rounded-sm"></div>
        <div className="w-24 h-3 bg-gray-100 rounded-sm"></div>
      </div>
    </div>
  );
};

export default AdminRecentOrderSkeleton;
