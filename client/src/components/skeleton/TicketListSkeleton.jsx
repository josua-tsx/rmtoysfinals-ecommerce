const TicketListSkeleton = () => {
  return (
    <div className="p-3 mb-2 rounded-[5px] border border-gray-200 bg-white animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-100 rounded w-16"></div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-3"></div>
      <div className="h-5 bg-gray-200 rounded w-20"></div>
    </div>
  );
};
export default TicketListSkeleton;
