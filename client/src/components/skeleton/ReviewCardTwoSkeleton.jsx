const ReviewCardTwoSkeleton = () => {
  return (
    <div className="relative mb-6 rounded-[5px] border border-gray-200 bg-white p-6 animate-pulse">
      {/* Pin Placeholder */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-gray-200 rounded-full m-2"></div>

      {/* Button Placeholder */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Review Header Placeholder */}
      <div className="flex items-start gap-6">
        <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0"></div>

        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex flex-col gap-2">
            <div className="w-1/3 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-20 h-6 bg-gray-100 rounded-sm"></div>
          </div>

          {/* Review Content Placeholder */}
          <div className="mt-2 h-24 bg-gray-50 p-4 rounded border border-dashed border-gray-200 w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCardTwoSkeleton;
