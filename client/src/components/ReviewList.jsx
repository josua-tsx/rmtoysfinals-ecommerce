import ReviewCardTwo from "./ReviewCardTwo";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function ReviewList({
  reviews = [],
  isPending,
  isError,
  emptyMessage,
}) {
  if (isError)
    return (
      <div className="flex justify-center items-center h-[500px] border border-dashed border-red-200 rounded-[5px] bg-red-50/30">
        <p className="font-black uppercase text-xs tracking-widest text-red-500">
          Error loading reviews.
        </p>
      </div>
    );

  return isPending ? (
    <div className="flex justify-center items-center flex-col h-[500px]">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="flex flex-col h-[700px] overflow-y-auto gap-4 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent pr-2">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <ReviewCardTwo key={review._id} review={review} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50/50 border border-dashed border-black/10 rounded-[5px]">
          <p className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 text-center px-4">
            {emptyMessage || "No reviews yet for this rating."}
          </p>
        </div>
      )}
    </div>
  );
}
