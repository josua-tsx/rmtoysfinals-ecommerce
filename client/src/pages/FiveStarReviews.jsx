import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ReviewCardTwo from "../components/ReviewCardTwo";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function FiveStarReviews() {
  const {
    data: fiveStarReviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["fiveStarReview"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-fiveStar`);
      return res.data;
    },
  });

  if (isError) return <p>Error.</p>;

  return isPending ? (
    <div className="flex justify-center items-center flex-col h-[500px]">
      <LoadingSpinner />
    </div>
  ) : (
    <>
      <div className="flex flex-col h-[700px]  overflow-y-auto  gap-4">
        {fiveStarReviews.length > 0 ? (
          fiveStarReviews?.map((five) => (
            <ReviewCardTwo key={five._id} review={five} />
          ))
        ) : (
          <p className="text-center h-[500px]">no five star review yet.</p>
        )}
      </div>
    </>
  );
}
