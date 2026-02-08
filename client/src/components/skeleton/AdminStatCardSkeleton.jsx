const AdminStatCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg relative mt-6 animate-pulse">
      {/* Sticker Header Placeholder */}
      <div className="absolute -top-4 -left-2 bg-gray-300 w-24 h-5 rounded-[5px] transform -rotate-1 z-10 border border-gray-300"></div>

      <div className="px-4 py-6 flex flex-col gap-2">
        <div className="flex flex-col gap-2 mt-2">
          {/* Value Placeholder */}
          <div className="h-8 bg-gray-200 w-32 rounded-sm"></div>
          {/* Subtext Placeholder */}
          <div className="h-3 bg-gray-100 w-20 rounded-sm"></div>
        </div>
      </div>
    </div>
  );
};
export default AdminStatCardSkeleton;
