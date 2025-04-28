import axiosInstance from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
import ReviewCardTwo from "../components/ReviewCardTwo";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function TwoStarReviews() {
  const {
    data: twoStarReviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["twoStarReview"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-twoStar`);
      return res.data;
    },
  });

  if (isError) return <p>Error.</p>;

  return isPending ? (
    <div className="flex justify-center items-center flex-col h-[500px]">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="flex flex-col h-[700px]  overflow-y-auto  gap-4">
      {twoStarReviews.length > 0 ? (
        twoStarReviews?.map((two) => (
          <ReviewCardTwo key={two._id} review={two} />
        ))
      ) : (
        <p className="text-center h-[500px]">no two star review yet.</p>
      )}
    </div>
  );
}
