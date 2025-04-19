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


  if (isPending) return <LoadingSpinner fullScreen/>;
  if (isError) return <p>Error.</p>;

  return (
    <div className="flex flex-col gap-4">
      {fiveStarReviews.length > 0 ? (
        fiveStarReviews?.map((five) => (
          <ReviewCardTwo key={five._id} review={five} />
        ))
      ) : (
        <p className="text-center">no five star review yet.</p>
      )}
    </div>
  );
}
