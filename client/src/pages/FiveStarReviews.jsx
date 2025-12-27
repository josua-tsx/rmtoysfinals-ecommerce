import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ReviewList from "../components/ReviewList";

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

  return (
    <ReviewList
      reviews={fiveStarReviews}
      isPending={isPending}
      isError={isError}
      emptyMessage="no five star review yet."
    />
  );
}
