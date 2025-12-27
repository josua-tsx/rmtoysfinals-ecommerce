import axiosInstance from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
import ReviewList from "../components/ReviewList";

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

  return (
    <ReviewList
      reviews={twoStarReviews}
      isPending={isPending}
      isError={isError}
      emptyMessage="no two star review yet."
    />
  );
}
