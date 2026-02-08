const AdminPaymentValidationSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden flex flex-col h-full"
        >
          {/* Header Placeholder */}
          <div className="p-3 border-b-2 border-gray-200 bg-gray-100 flex justify-between items-center h-12">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>

          {/* Image Placeholder */}
          <div className="relative aspect-video bg-gray-200 border-b-2 border-gray-200"></div>

          {/* Details Placeholder */}
          <div className="p-4 flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
                <div className="w-32 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <div className="w-16 h-3 bg-gray-200 rounded"></div>
                <div className="w-24 h-6 bg-gray-300 rounded"></div>
              </div>
            </div>

            <div className="w-full h-12 bg-gray-50 border border-gray-100 rounded"></div>
          </div>

          {/* Actions Placeholder */}
          <div className="p-3 border-t-2 border-gray-200 grid grid-cols-2 gap-3 bg-gray-50">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default AdminPaymentValidationSkeleton;
