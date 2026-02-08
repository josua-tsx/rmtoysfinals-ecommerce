const AdminTableSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="h-12 bg-gray-200 w-full mb-1"></div>
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center border-b border-gray-100 py-4 px-4 bg-white"
        >
          <div className="h-4 bg-gray-100 rounded w-16 mr-4"></div>
          <div className="h-4 bg-gray-100 rounded w-32 mr-4 flex-1"></div>
          <div className="h-4 bg-gray-100 rounded w-24 mr-4"></div>
          <div className="h-4 bg-gray-100 rounded w-20 mr-4"></div>
          <div className="h-4 bg-gray-100 rounded w-20 mr-4"></div>
          <div className="h-4 bg-gray-100 rounded w-24"></div>
        </div>
      ))}
    </div>
  );
};
export default AdminTableSkeleton;
