const ShopSideSkeleton = () => {
  return (
    <div className="flex w-[90%] mx-auto md:w-[320px] justify-center px-5 gap-5 flex-col relative md:justify-start p-3 border-gray-200 border rounded-[5px] bg-white mt-4 animate-pulse min-h-[500px]">
      {/* Sticker Placeholders */}
      <div className="absolute -top-4 -left-3 bg-gray-300 w-24 h-8 rounded-[5px]"></div>

      {/* Header Area */}
      <div className="flex justify-between pb-2 pt-6">
        <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-[5px]"></div>
      </div>

      {/* Search Input Placeholder */}
      <div className="w-full h-10 bg-gray-200 rounded-[8px] mb-4"></div>

      {/* Filter Sections Placeholders */}
      <div className="flex flex-col gap-6">
        {/* Sort Section */}
        <div className="flex flex-col gap-2">
          <div className="w-1/3 h-6 bg-gray-200 rounded-sm"></div>
          <div className="flex flex-col gap-2 pl-2">
            <div className="w-1/2 h-4 bg-gray-100 rounded-sm"></div>
            <div className="w-1/2 h-4 bg-gray-100 rounded-sm"></div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
          <div className="w-1/2 h-8 bg-gray-200 rounded-sm mb-2"></div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded-sm"></div>
                <div className="w-3/4 h-4 bg-gray-100 rounded-sm"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 h-10 bg-gray-300 rounded-[5px]"></div>
          <div className="w-20 h-10 bg-gray-200 rounded-[5px]"></div>
        </div>
      </div>
    </div>
  );
};

export default ShopSideSkeleton;
