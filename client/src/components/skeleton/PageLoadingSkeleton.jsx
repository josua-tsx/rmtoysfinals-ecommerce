export default function PageLoadingSkeleton() {
  return (
    <div className="h-screen bg-[#fffdf6] animate-pulse">
      {/* Navbar Skeleton */}
      <div className="h-16 bg-gray-200 border-b border-gray-300" />

      {/* Content Area */}
      <div className="max-w-[90%] mx-auto pt-10 flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded-[5px]" />
          <div className="h-10 w-32 bg-gray-200 rounded-[5px]" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 bg-gray-200 rounded-[5px] border border-gray-300"
            />
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="border border-gray-300 rounded-[5px] bg-white">
          {/* Table Header */}
          <div className="h-12 bg-gray-200 rounded-t-[5px]" />

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-14 flex items-center gap-4 px-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded flex-1" />
                <div className="h-8 w-16 bg-gray-200 rounded-[5px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
