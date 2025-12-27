import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import ReviewList from "../components/ReviewList";

export default function ThreeStarReviews() {
  const {
    data: threeStarReviews = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["threeStarReview"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/review/get-threeStar`);
      return res.data;
    },
  });

  return (
    <ReviewList
      reviews={threeStarReviews}
      isPending={isPending}
      isError={isError}
      emptyMessage="no three star review yet."
    />
  );
}
