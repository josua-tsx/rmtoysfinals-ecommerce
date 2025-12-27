import { TbPinnedFilled } from "react-icons/tb";
import StarsRating from "./StarsRating";
import { useNavigate } from "react-router-dom";

export default function ReviewCardTwo({ review }) {
  const navigate = useNavigate();
  const handleNavigate = (productId) => {
    navigate(`/product/details/${productId}`);
  };

  return (
    <div className="relative mb-6 rounded-[5px] border border-black bg-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="absolute -top-3 -right-2 text-red-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] z-10">
        <TbPinnedFilled size={28} />
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleNavigate(review.productId)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors group"
        >
          <span>go to product</span>
          <svg
            className="w-3 h-3 transform transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>

      {/* Review header */}
      <div className="flex items-start gap-6">
        <div className="relative shrink-0">
          <img
            src={review?.userId?.avatar || "/default-avatar.png"}
            alt={review?.userId?.username}
            className="h-12 w-12 rounded-full border border-black object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black uppercase text-xs tracking-wider text-gray-900 mb-1">
                {review?.userId?.username}
              </h3>
              <div className="flex items-center gap-2 bg-yellow/50 w-fit p-1 rounded border border-black/5">
                <StarsRating rating={review.rating} size={14} />
              </div>
            </div>
          </div>

          {/* Review content */}
          <div className="mt-4 break-all bg-gray-50/50 p-4 rounded border border-dashed border-black/10">
            <p className="text-gray-700 leading-relaxed font-main-text text-sm">
              {review?.commentReview}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
