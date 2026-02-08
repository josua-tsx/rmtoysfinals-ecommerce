const AdminLatestReviewSkeleton = () => {
  return (
    <div className="border border-gray-200 flex justify-center items-center rounded-lg relative bg-white mt-6 animate-pulse h-[250px]">
      {/* Sticker Header Placeholder */}
      <div className="absolute -top-4 -left-3 bg-gray-300 w-28 h-6 rounded-[5px] transform -rotate-1 z-30 border border-gray-300"></div>

      {/* Pin Placeholder */}
      <div className="w-6 h-6 bg-gray-200 absolute right-3 top-3 rounded-full border border-gray-300"></div>

      <div className="p-4 pt-8 flex flex-col gap-4 items-center w-full">
        <div className="w-32 h-3 bg-gray-200 rounded-sm"></div>

        <div className="border border-gray-200 p-1 bg-white rounded-full overflow-hidden">
          <div className="h-[60px] w-[60px] rounded-full bg-gray-200"></div>
        </div>

        <div className="w-full flex flex-col justify-center items-center gap-2">
          <div className="w-24 h-4 bg-gray-300 rounded-sm"></div>
          <div className="w-48 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-32 h-4 bg-gray-200 rounded-sm mt-1"></div>
          <div className="w-full h-8 bg-gray-300 rounded-[5px] mt-2"></div>
        </div>
      </div>
    </div>
  );
};
export default AdminLatestReviewSkeleton;
