import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ReviewList from "../components/ReviewList";

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

  return (
    <ReviewList
      reviews={oneStarReviews}
      isPending={isPending}
      isError={isError}
      emptyMessage="no one star review yet."
    />
  );
}
