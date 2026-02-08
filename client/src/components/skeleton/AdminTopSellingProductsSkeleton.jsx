const AdminTopSellingProductsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="relative flex flex-col items-center border border-gray-200 rounded-lg p-4 bg-white h-full"
        >
          {/* Badge Placeholder */}
          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>

          {/* Image Placeholder */}
          <div className="w-full aspect-square mb-3 bg-gray-200 rounded-md"></div>

          {/* Details Placeholder */}
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-3/4 h-3 bg-gray-200 rounded-sm"></div>
            <div className="w-1/2 h-3 bg-gray-200 rounded-sm"></div>

            <div className="w-20 h-6 bg-gray-100 rounded-full mt-2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default AdminTopSellingProductsSkeleton;
