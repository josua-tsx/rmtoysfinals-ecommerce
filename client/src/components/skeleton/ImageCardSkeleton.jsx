const ImageCardSkeleton = () => {
  return (
    <div className="w-[200px] md:w-[250px] flex flex-col justify-between gap-1 relative mx-auto animate-pulse">
      {/* Sticker Placeholder */}
      <div className="absolute -top-2 -left-2 bg-gray-300 w-24 h-5 rounded-sm transform -rotate-3 z-30"></div>

      {/* Pin Placeholder */}
      <div className="absolute top-2 right-2 w-6 h-6 bg-gray-300 rounded-full z-10"></div>

      {/* Image Area */}
      <div className="h-[190px] md:h-[230px] bg-white border border-gray-200 rounded-t-[5px] p-4 relative w-full">
        <div className="w-full h-full bg-gray-100 rounded-sm flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-200"
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

      {/* Button Placeholder */}
      <div className="h-[34px] bg-gray-200 w-full rounded-b-[5px] border border-gray-300"></div>
    </div>
  );
};

export default ImageCardSkeleton;
