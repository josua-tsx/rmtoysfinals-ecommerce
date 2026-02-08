const ShopProductCardSkeleton = () => {
  return (
    <div className="w-72 md:w-full h-[320px] md:h-[350px] border mx-auto items-center flex flex-col justify-center bg-white border-gray-200 relative mt-4 overflow-hidden rounded-[5px] animate-pulse">
      {/* Sticker Header Placeholder */}
      <div className="absolute -top-3 -right-2 bg-gray-300 w-20 h-6 rounded-[5px] transform rotate-2 z-20"></div>

      {/* Image Area Placeholder */}
      <div className="w-full flex-grow bg-gray-100 relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-200">
          <svg
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Content Area Placeholder */}
      <div className="p-3 flex flex-col gap-3 w-full h-auto min-h-[100px] border-t border-gray-100 bg-white z-10">
        <div className="flex w-full justify-between items-start gap-2">
          <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
          <div className="h-6 bg-gray-200 w-16 rounded px-2"></div>
        </div>

        <div className="flex justify-between items-center pt-1 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="h-3 bg-gray-200 w-12 rounded"></div>
          </div>
          <div className="flex gap-1">
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 w-12 rounded"></div>
          <div className="h-3 bg-gray-200 w-8 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ShopProductCardSkeleton;
