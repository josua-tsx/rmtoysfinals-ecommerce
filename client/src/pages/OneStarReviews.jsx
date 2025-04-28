import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ReviewCardTwo from "../components/ReviewCardTwo";
import LoadingSpinner from "../reusable/LoadingSpinner";

export default function OneStarReviews() {
  const {
    data: oneStarReviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["oneStarReview"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-oneStar`);
      return res.data;
    },
  });

  if (isError) return <p>Error.</p>;

  return isPending ? (
    <div className="flex justify-center items-center flex-col h-[500px]">
      <LoadingSpinner />
    </div>
  ) : (
    <div className="flex flex-col h-[700px]  overflow-y-auto gap-4">
      {oneStarReviews.length > 0 ? (
        oneStarReviews?.map((one) => (
          <ReviewCardTwo key={one._id} review={one} />
        ))
      ) : (
        <p className="text-center h-[500px]">no one star review yet.</p>
      )}
    </div>
  );
}
