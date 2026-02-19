export default function FaqSkeleton() {
  return (
    <div className="flex flex-col w-full md:w-[750px] gap-5 animate-pulse">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-[68px] w-full bg-white border-2 border-gray-300 rounded-[5px] relative shadow-[4px_4px_0px_0px_rgba(224,224,224,1)]"
        >
          <div className="flex items-center h-full px-4">
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
          <div className="absolute right-4 top-5">
            <div className="h-6 w-6 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
